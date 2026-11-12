<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send 1-week reminder emails with dual-confirmation buttons to patients and doctors';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $appointments = Appointment::whereNull('reminder_sent_at')
            ->whereNotIn('status', ['Confirmed', 'Cancelled'])
            ->get();

        $sentCount = 0;

        foreach ($appointments as $appointment) {
            if ($appointment->shouldSendReminder()) {
                $success = $appointment->sendConfirmationReminders();
                if ($success) {
                    $sentCount++;
                    $this->info("Sent confirmation reminder for appointment #{$appointment->id} ({$appointment->patient_name} with {$appointment->doctor})");
                }
            }
        }

        $this->info("Completed sending {$sentCount} appointment reminder email(s).");

        return Command::SUCCESS;
    }
}
