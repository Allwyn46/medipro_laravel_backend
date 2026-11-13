<?php

namespace App\Console\Commands;

use App\Services\AppointmentExpirationService;
use Illuminate\Console\Command;

class ExpireUnconfirmedAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:expire-unconfirmed {--grace=15 : Grace period in minutes past start time}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan and expire unconfirmed appointments past their start time grace period to Reschedule status.';

    /**
     * Execute the console command.
     */
    public function handle(AppointmentExpirationService $expirationService): int
    {
        $grace = (int) $this->option('grace');
        $this->info("Scanning unconfirmed appointments with {$grace}-minute grace period...");

        $expired = $expirationService->expirePastDueAppointments($grace);

        $this->info("Successfully expired {$expired} past-due appointment(s) to Reschedule status.");

        return Command::SUCCESS;
    }
}
