<?php

namespace App\Services;

use App\Models\Appointment;

class AppointmentCalendarService
{
    /**
     * Generate a 1-click Google Calendar web intent URL.
     */
    public function generateGoogleCalendarUrl(Appointment $appointment): string
    {
        $start = $appointment->getScheduledStartDateTime();
        $durationMinutes = $this->parseDurationMinutes($appointment->duration);
        $end = $start->copy()->addMinutes($durationMinutes);

        // Google Calendar requires format: Ymd\THis\Z in UTC
        $dates = $start->copy()->utc()->format('Ymd\THis\Z').'/'.$end->copy()->utc()->format('Ymd\THis\Z');

        $title = "Consultation with {$appointment->doctor}";
        $details = "Medical Consultation ({$appointment->service})\nSpecialist: {$appointment->doctor}\nRoom: ".($appointment->room ?: 'Consultation Suite 1')."\nClinic: MediPro Clinic";
        $location = ($appointment->room ?: 'Consultation Suite 1').', MediPro Clinic, 100 Medical Boulevard, Suite 400';

        $params = [
            'action' => 'TEMPLATE',
            'text' => $title,
            'dates' => $dates,
            'details' => $details,
            'location' => $location,
        ];

        return 'https://calendar.google.com/calendar/render?'.http_build_query($params);
    }

    /**
     * Generate an RFC 5545 compliant iCalendar (.ics) string.
     */
    public function generateIcsContent(Appointment $appointment, int $sequence = 0): string
    {
        $start = $appointment->getScheduledStartDateTime();
        $durationMinutes = $this->parseDurationMinutes($appointment->duration);
        $end = $start->copy()->addMinutes($durationMinutes);

        $dtStamp = now()->utc()->format('Ymd\THis\Z');
        $dtStart = $start->copy()->utc()->format('Ymd\THis\Z');
        $dtEnd = $end->copy()->utc()->format('Ymd\THis\Z');

        $uid = "medipro-apt-{$appointment->id}@medipro.com";
        $summary = $this->escapeIcs("Consultation with {$appointment->doctor}");
        $description = $this->escapeIcs("Medical Consultation ({$appointment->service})\nSpecialist: {$appointment->doctor}\nRoom: ".($appointment->room ?: 'Consultation Suite 1')."\nClinic: MediPro Clinic");
        $location = $this->escapeIcs(($appointment->room ?: 'Consultation Suite 1').', MediPro Clinic');

        return "BEGIN:VCALENDAR\r\n"
            ."VERSION:2.0\r\n"
            ."PRODID:-//MediPro Clinic//Appointment Scheduler//EN\r\n"
            ."CALSCALE:GREGORIAN\r\n"
            ."METHOD:REQUEST\r\n"
            ."BEGIN:VEVENT\r\n"
            ."UID:{$uid}\r\n"
            ."DTSTAMP:{$dtStamp}\r\n"
            ."DTSTART:{$dtStart}\r\n"
            ."DTEND:{$dtEnd}\r\n"
            ."SUMMARY:{$summary}\r\n"
            ."DESCRIPTION:{$description}\r\n"
            ."LOCATION:{$location}\r\n"
            ."STATUS:CONFIRMED\r\n"
            ."SEQUENCE:{$sequence}\r\n"
            ."END:VEVENT\r\n"
            ."END:VCALENDAR\r\n";
    }

    /**
     * Parse duration string (e.g. "45 mins", "30 minutes", "1 hour") into minutes.
     */
    public function parseDurationMinutes(?string $duration): int
    {
        if (empty($duration)) {
            return 45;
        }

        if (preg_match('/(\d+)\s*(?:min|minute)/i', $duration, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/(\d+)\s*(?:hr|hour)/i', $duration, $matches)) {
            return (int) $matches[1] * 60;
        }

        return 45;
    }

    /**
     * Escape special characters for iCalendar format.
     */
    private function escapeIcs(string $text): string
    {
        $text = str_replace('\\', '\\\\', $text);
        $text = str_replace(';', '\;', $text);
        $text = str_replace(',', '\,', $text);
        $text = str_replace(["\r\n", "\n", "\r"], '\n', $text);

        return $text;
    }
}
