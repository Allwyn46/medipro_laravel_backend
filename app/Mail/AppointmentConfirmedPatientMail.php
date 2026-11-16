<?php

namespace App\Mail;

use App\Models\Appointment;
use App\Services\AppointmentCalendarService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmedPatientMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $googleCalendarUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Appointment $appointment
    ) {
        $calendarService = app(AppointmentCalendarService::class);
        $this->googleCalendarUrl = $calendarService->generateGoogleCalendarUrl($appointment);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment Confirmation - MediPro Clinic',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.confirmed',
            with: [
                'appointment' => $this->appointment,
                'googleCalendarUrl' => $this->googleCalendarUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $calendarService = app(AppointmentCalendarService::class);
        $icsContent = $calendarService->generateIcsContent($this->appointment, 0);

        return [
            Attachment::fromData(fn () => $icsContent, "appointment-{$this->appointment->id}.ics")
                ->withMime('text/calendar; charset=UTF-8; method=REQUEST'),
        ];
    }
}
