<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
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
        'createdAt',
        'lastContactDate',
        'paymentStatus',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'float',
            'last_contact_date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get all activities associated with this lead.
     *
     * @return HasMany<LeadActivity, $this>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->orderBy('id');
    }

    /**
     * Accessor for camelCase createdAt expected by frontend components.
     */
    public function getCreatedAtAttribute(): ?string
    {
        return isset($this->attributes['created_at'])
            ? Carbon::parse($this->attributes['created_at'])->format('Y-m-d')
            : null;
    }

    /**
     * Accessor for camelCase lastContactDate expected by frontend components.
     */
    public function getLastContactDateAttribute(): ?string
    {
        return isset($this->attributes['last_contact_date'])
            ? Carbon::parse($this->attributes['last_contact_date'])->format('Y-m-d')
            : null;
    }

    /**
     * Accessor for camelCase paymentStatus expected by frontend components.
     */
    public function getPaymentStatusAttribute(): string
    {
        return $this->attributes['payment_status'] ?? 'Pending';
    }
}
