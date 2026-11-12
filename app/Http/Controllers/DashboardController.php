<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the clinical dashboard with live metrics and appointments.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isDoctor = $user && $user->isDoctor();
        $isAdmin = $user && $user->isAdmin();

        // If doctor, strictly lock to their doctor profile; if admin, allow filtering by doctor_id query param
        $selectedDoctorId = $isDoctor
            ? $user->doctor?->id
            : ($request->filled('doctor_id') ? (int) $request->query('doctor_id') : null);

        $selectedDoctor = $selectedDoctorId ? Doctor::find($selectedDoctorId) : null;

        $leadsQuery = Lead::query();
        $appointmentsQuery = Appointment::query();

        if ($selectedDoctorId) {
            $leadsQuery->where(function ($q) use ($selectedDoctorId, $selectedDoctor) {
                $q->where('doctor_id', $selectedDoctorId);
                if ($selectedDoctor?->name) {
                    $q->orWhere('doctor', $selectedDoctor->name);
                }
            });
            $appointmentsQuery->where(function ($q) use ($selectedDoctorId, $selectedDoctor) {
                $q->where('doctor_id', $selectedDoctorId);
                if ($selectedDoctor?->name) {
                    $q->orWhere('doctor', $selectedDoctor->name);
                }
            });
        }

        // Calculate doctor-wise revenue breakdown
        $allActiveDoctors = Doctor::active()->get();
        $doctorRevenues = [];
        $totalClinicRev = 0;

        foreach ($allActiveDoctors as $doc) {
            $docLeadsQuery = Lead::where(function ($q) use ($doc) {
                $q->where('doctor_id', $doc->id)
                    ->orWhere('doctor', $doc->name);
            });

            $docWon = (float) (clone $docLeadsQuery)->where('status', 'Won')->sum('value');
            $docAll = (float) (clone $docLeadsQuery)->sum('value');
            $docRevenue = $docWon > 0 ? $docWon : $docAll;
            $totalClinicRev += $docRevenue;

            if ($isAdmin) {
                $docLeadsCount = (clone $docLeadsQuery)->count();
                $docAppointmentsCount = Appointment::where(function ($q) use ($doc) {
                    $q->where('doctor_id', $doc->id)
                        ->orWhere('doctor', $doc->name);
                })->where('status', '!=', 'Cancelled')->count();

                $doctorRevenues[] = [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'specialty' => $doc->specialty,
                    'room' => $doc->room,
                    'revenue' => $docRevenue,
                    'formattedRevenue' => '₹'.number_format($docRevenue, 2),
                    'leadsCount' => $docLeadsCount,
                    'appointmentsCount' => $docAppointmentsCount,
                    'consultationFee' => $doc->consultation_fee,
                    'percentageOfTotal' => 0,
                ];
            }
        }

        // Account for any unassigned leads if doctors exist
        if ($allActiveDoctors->isNotEmpty()) {
            $docIds = $allActiveDoctors->pluck('id')->filter()->all();
            $docNames = $allActiveDoctors->pluck('name')->filter()->all();

            $unassignedLeadsQuery = Lead::where(function ($q) use ($docIds) {
                $q->whereNull('doctor_id')->orWhereNotIn('doctor_id', $docIds);
            })->where(function ($q) use ($docNames) {
                $q->whereNull('doctor')->orWhereNotIn('doctor', $docNames);
            });

            $unassignedWon = (float) (clone $unassignedLeadsQuery)->where('status', 'Won')->sum('value');
            $unassignedAll = (float) (clone $unassignedLeadsQuery)->sum('value');
            $unassignedRevenue = $unassignedWon > 0 ? $unassignedWon : $unassignedAll;
            $totalClinicRev += $unassignedRevenue;
        } else {
            // Fallback when no doctors are registered in the clinic
            $wonRevenue = (float) (clone $leadsQuery)->where('status', 'Won')->sum('value');
            $allValue = (float) (clone $leadsQuery)->sum('value');
            $totalClinicRev = $wonRevenue > 0 ? $wonRevenue : $allValue;
        }

        if ($isAdmin) {
            foreach ($doctorRevenues as &$dRev) {
                $dRev['percentageOfTotal'] = $totalClinicRev > 0
                    ? round(($dRev['revenue'] / $totalClinicRev) * 100, 1)
                    : 0;
            }
            unset($dRev);
        }

        if ($selectedDoctorId) {
            $wonRevenue = (float) (clone $leadsQuery)->where('status', 'Won')->sum('value');
            $allValue = (float) (clone $leadsQuery)->sum('value');
            $revenue = $wonRevenue > 0 ? $wonRevenue : $allValue;
        } else {
            $revenue = $totalClinicRev;
        }

        $newAppointmentsCount = (clone $appointmentsQuery)->where('status', '!=', 'Cancelled')->count();
        $todayAppointmentsCount = (clone $appointmentsQuery)->where('date', 'Today')->where('status', '!=', 'Cancelled')->count();
        $activeLeadsCount = (clone $leadsQuery)->whereNotIn('status', ['Won', 'Lost'])->count();
        $awaitingConsultationCount = (clone $leadsQuery)->where('status', 'Consultation Scheduled')->count();

        if ($isDoctor) {
            $revenueTitle = 'My Consultation Revenue';
            $appointmentsSubtext = 'Assigned to your clinic schedule';
            $leadsTitle = 'My Patient Leads';
        } elseif ($selectedDoctor) {
            $revenueTitle = "{$selectedDoctor->name}'s Revenue";
            $appointmentsSubtext = "Assigned to {$selectedDoctor->name}";
            $leadsTitle = "{$selectedDoctor->name}'s Leads";
        } else {
            $revenueTitle = 'Total Clinic Revenue';
            $appointmentsSubtext = 'Across all clinic specialists';
            $leadsTitle = 'Active Patient Leads';
        }

        $metrics = [
            [
                'title' => $revenueTitle,
                'value' => '₹'.number_format($revenue, 2),
                'badgeText' => '+14.5%',
                'badgeTrend' => 'up',
                'footerTrendText' => 'Trending up this month',
                'footerSubtext' => 'Consultations & procedure billings',
            ],
            [
                'title' => 'New Appointments',
                'value' => (string) $newAppointmentsCount,
                'badgeText' => '+18.2%',
                'badgeTrend' => 'up',
                'footerTrendText' => "{$todayAppointmentsCount} scheduled for today",
                'footerSubtext' => $appointmentsSubtext,
            ],
            [
                'title' => $leadsTitle,
                'value' => (string) $activeLeadsCount,
                'badgeText' => '+9.4%',
                'badgeTrend' => 'up',
                'footerTrendText' => "{$awaitingConsultationCount} awaiting consultation",
                'footerSubtext' => 'High conversion momentum',
            ],
            [
                'title' => 'Attendance Rate',
                'value' => '96.4%',
                'badgeText' => '+3.2%',
                'badgeTrend' => 'up',
                'footerTrendText' => 'Steady patient show-up',
                'footerSubtext' => 'Low cancellation rate this month',
            ],
        ];

        $appointments = (clone $appointmentsQuery)
            ->where('status', '!=', 'Pending')
            ->orderBy('id')
            ->get();

        $pendingAppointments = (clone $appointmentsQuery)
            ->where('status', 'Pending')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => $metrics,
            'appointments' => $appointments,
            'pendingAppointments' => $pendingAppointments,
            'doctorRevenues' => $doctorRevenues,
            'selectedDoctorId' => $isDoctor ? null : $selectedDoctorId,
        ]);
    }
}
