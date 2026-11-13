<?php

namespace App\Services;

use App\Mail\AppointmentRescheduleNoticeMail;
use App\Models\Appointment;
use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentExpirationService
{
    /**
     * Scan and expire past-due unconfirmed appointments.
     *
     * @param  int  $graceMinutes  Clinical grace window after appointment start time (default 15 minutes)
     * @return int Number of appointments transitioned to Reschedule
     */
    public function expirePastDueAppointments(int $graceMinutes = 15): int
    {
        $candidates = Appointment::whereIn('status', ['Pending', 'Awaiting Confirmation'])->get();
        $expiredCount = 0;

        foreach ($candidates as $candidate) {
            if (! $candidate->isPastGracePeriod($graceMinutes)) {
                continue;
            }

            try {
                $transitioned = DB::transaction(function () use ($candidate) {
                    $appointment = Appointment::lockForUpdate()->find($candidate->id);

                    if (! $appointment || ! in_array($appointment->status, ['Pending', 'Awaiting Confirmation'], true)) {
                        return false;
                    }

                    $oldStatus = $appointment->status;
                    $appointment->update([
                        'status' => 'Reschedule',
                    ]);

                    // Sync lead status if this is the lead's latest appointment
                    if ($appointment->lead_id) {
                        $lead = Lead::find($appointment->lead_id);
                        if ($lead) {
                            $latestAppointment = Appointment::where('lead_id', $lead->id)
                                ->orderByDesc('id')
                                ->first();

                            if ($latestAppointment && $latestAppointment->id === $appointment->id) {
                                $lead->update([
                                    'status' => 'Reschedule',
                                    'last_contact_date' => now()->format('Y-m-d'),
                                ]);
                            }

                            LeadActivity::create([
                                'lead_id' => $lead->id,
                                'type' => 'Status Change',
                                'title' => 'Appointment Expired - Moved to Reschedule',
                                'description' => "Unconfirmed appointment for {$appointment->date} at {$appointment->time} with {$appointment->doctor} reached the 15-minute start cutoff and was automatically moved to Reschedule.",
                                'doctor' => $appointment->doctor ?: 'Clinical System',
                                'date' => now()->format('Y-m-d H:i'),
                            ]);
                        }
                    }

                    // Dispatch notification email to patient
                    if (! empty($appointment->patient_email)) {
                        $rebookUrl = url('/#booking');
                        $reason = ($oldStatus === 'Pending') ? 'pending_unreviewed' : 'unconfirmed';

                        try {
                            Mail::to($appointment->patient_email)
                                ->queue(new AppointmentRescheduleNoticeMail($appointment, $rebookUrl, $reason));
                        } catch (\Throwable $mailErr) {
                            Log::error("Failed to queue reschedule notice for appointment #{$appointment->id}: ".$mailErr->getMessage());
                        }
                    }

                    return true;
                });

                if ($transitioned) {
                    $expiredCount++;
                }
            } catch (\Throwable $e) {
                Log::error("Error expiring appointment #{$candidate->id}: ".$e->getMessage());
            }
        }

        return $expiredCount;
    }
}
