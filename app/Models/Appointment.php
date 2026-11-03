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
    ];

    /**
     * Get the lead associated with this appointment.
     *
     * @return BelongsTo<Lead, $this>
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
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
}
