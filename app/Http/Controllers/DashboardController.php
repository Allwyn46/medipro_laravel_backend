<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Lead;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the clinical dashboard with live metrics and appointments.
     */
    public function index(): Response
    {
        $allLeadsValue = (float) Lead::sum('value');
        $newAppointmentsCount = Appointment::where('status', '!=', 'Cancelled')->count();
        $todayAppointmentsCount = Appointment::where('date', 'Today')->where('status', '!=', 'Cancelled')->count();
        $activeLeadsCount = Lead::whereNotIn('status', ['Won', 'Lost'])->count();
        $awaitingConsultationCount = Lead::where('status', 'Consultation Scheduled')->count();

        $metrics = [
            [
                'title' => 'Total Clinic Revenue',
                'value' => '₹'.number_format($allLeadsValue, 2),
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
                'footerSubtext' => 'Across all clinic specialists',
            ],
            [
                'title' => 'Active Patient Leads',
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

        $appointments = Appointment::where('status', '!=', 'Pending')
            ->orderBy('id')
            ->get();

        $pendingAppointments = Appointment::where('status', 'Pending')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => $metrics,
            'appointments' => $appointments,
            'pendingAppointments' => $pendingAppointments,
        ]);
    }
}
