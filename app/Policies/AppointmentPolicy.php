<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * Determine whether the user can view the appointment.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin() || ($user->doctor && $appointment->doctor_id === $user->doctor->id);
    }

    /**
     * Determine whether the user can update/confirm/decline the appointment.
     */
    public function update(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin() || ($user->doctor && $appointment->doctor_id === $user->doctor->id);
    }

    /**
     * Determine whether the user can delete the appointment.
     */
    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin();
    }
}
