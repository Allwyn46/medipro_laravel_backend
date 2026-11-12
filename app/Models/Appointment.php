<?php

namespace App\Models;

use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'patientName',
        'patientEmail',
        'patientPhone',
        'dateTimeFormatted',
        'leadId',
        'requestedAt',
        'patientConfirmedAt',
        'doctorConfirmedAt',
        'isFullyConfirmed',
        'confirmationStatus',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'patient_confirmed_at' => 'datetime',
            'doctor_confirmed_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
        ];
    }

    /**
     * Get the lead associated with this appointment.
     *
     * @return BelongsTo<Lead, $this>
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the doctor associated with this appointment.
     *
     * @return BelongsTo<Doctor, $this>
     */
    public function doctorProfile(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function getPatientNameAttribute(): ?string
    {
        return $this->attributes['patient_name'] ?? null;
    }

    public function getPatientEmailAttribute(): ?string
    {
        return $this->attributes['patient_email'] ?? null;
    }

    public function getPatientPhoneAttribute(): ?string
    {
        return $this->attributes['patient_phone'] ?? null;
    }

    public function getLeadIdAttribute(): ?int
    {
        return isset($this->attributes['lead_id']) ? (int) $this->attributes['lead_id'] : null;
    }

    public function getRequestedAtAttribute(): ?string
    {
        return $this->attributes['requested_at'] ?? null;
    }

    public function getDateTimeFormattedAttribute(): string
    {
        $date = $this->attributes['date'] ?? '';
        $time = $this->attributes['time'] ?? '';

        return trim("{$date} at {$time}");
    }

    public function getPatientConfirmedAtAttribute(): ?string
    {
        return $this->patient_confirmed_at?->toISOString();
    }

    public function getDoctorConfirmedAtAttribute(): ?string
    {
        return $this->doctor_confirmed_at?->toISOString();
    }

    public function getIsFullyConfirmedAttribute(): bool
    {
        return $this->patient_confirmed_at !== null && $this->doctor_confirmed_at !== null;
    }

    public function getConfirmationStatusAttribute(): string
    {
        if ($this->is_fully_confirmed || $this->status === 'Confirmed') {
            return 'Confirmed';
        }
        if ($this->patient_confirmed_at && ! $this->doctor_confirmed_at) {
            return 'Awaiting Doctor';
        }
        if (! $this->patient_confirmed_at && $this->doctor_confirmed_at) {
            return 'Awaiting Patient';
        }

        return 'Awaiting Confirmations';
    }

    public function getScheduledDate(): \Carbon\Carbon
    {
        $val = trim((string) ($this->attributes['date'] ?? ''));
        if (strtolower($val) === 'today') {
            return now()->startOfDay();
        }
        if (strtolower($val) === 'tomorrow') {
            return now()->addDay()->startOfDay();
        }

        try {
            return \Carbon\Carbon::parse($val)->startOfDay();
        } catch (\Throwable) {
            return now()->startOfDay();
        }
    }

    /**
     * Check if a 1-week reminder should be sent.
     */
    public function shouldSendReminder(): bool
    {
        if ($this->reminder_sent_at !== null) {
            return false;
        }

        if (in_array($this->status, ['Confirmed', 'Cancelled'])) {
            return false;
        }

        $scheduledDate = $this->getScheduledDate();

        // 1 week before the selected date (i.e. scheduledDate - 7 days <= now)
        return $scheduledDate->lte(now()->addDays(7)->endOfDay());
    }

    /**
     * Send dual confirmation reminder emails to both patient and doctor.
     */
    public function sendConfirmationReminders(): bool
    {
        // Ensure secure unique tokens exist
        $dirty = false;
        if (! $this->patient_token) {
            $this->patient_token = \Illuminate\Support\Str::random(40);
            $dirty = true;
        }
        if (! $this->doctor_token) {
            $this->doctor_token = \Illuminate\Support\Str::random(40);
            $dirty = true;
        }

        if ($dirty) {
            $this->save();
        }

        $patientConfirmUrl = route('appointments.email-confirm', ['token' => $this->patient_token]);
        $doctorConfirmUrl = route('appointments.email-confirm', ['token' => $this->doctor_token]);

        // Resolve doctor email
        $doctorEmail = $this->doctorProfile?->email
            ?: Doctor::where('name', $this->doctor)->value('email')
            ?: ($this->doctor_id ? Doctor::find($this->doctor_id)?->email : null);

        try {
            if ($this->patient_email) {
                \Illuminate\Support\Facades\Mail::to($this->patient_email)
                    ->send(new \App\Mail\AppointmentPatientReminderMail($this, $patientConfirmUrl));
            }

            if ($doctorEmail) {
                \Illuminate\Support\Facades\Mail::to($doctorEmail)
                    ->send(new \App\Mail\AppointmentDoctorReminderMail($this, $doctorConfirmUrl));
            }

            $this->update(['reminder_sent_at' => now()]);

            return true;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send appointment reminder emails: '.$e->getMessage());

            return false;
        }
    }
}
