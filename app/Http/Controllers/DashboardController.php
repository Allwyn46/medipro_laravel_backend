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
        $user = auth()->user();
        $isDoctor = $user && $user->isDoctor();
        $doctorId = $isDoctor ? $user->doctor?->id : null;

        $leadsQuery = Lead::query();
        $appointmentsQuery = Appointment::query();

        if ($isDoctor) {
            $leadsQuery->where('doctor_id', $doctorId);
            $appointmentsQuery->where('doctor_id', $doctorId);
        }

        $wonRevenue = (float) (clone $leadsQuery)->where('status', 'Won')->sum('value');
        $allValue = (float) (clone $leadsQuery)->sum('value');
        $revenue = $wonRevenue > 0 ? $wonRevenue : $allValue;

        $newAppointmentsCount = (clone $appointmentsQuery)->where('status', '!=', 'Cancelled')->count();
        $todayAppointmentsCount = (clone $appointmentsQuery)->where('date', 'Today')->where('status', '!=', 'Cancelled')->count();
        $activeLeadsCount = (clone $leadsQuery)->whereNotIn('status', ['Won', 'Lost'])->count();
        $awaitingConsultationCount = (clone $leadsQuery)->where('status', 'Consultation Scheduled')->count();

        $revenueTitle = $isDoctor ? 'My Consultation Revenue' : 'Total Clinic Revenue';
        $appointmentsSubtext = $isDoctor ? 'Assigned to your clinic schedule' : 'Across all clinic specialists';
        $leadsTitle = $isDoctor ? 'My Patient Leads' : 'Active Patient Leads';

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
        ]);
    }
}
