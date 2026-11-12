<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('patient_token', 64)->nullable()->unique()->after('requested_at');
            $table->string('doctor_token', 64)->nullable()->unique()->after('patient_token');
            $table->timestamp('patient_confirmed_at')->nullable()->after('doctor_token');
            $table->timestamp('doctor_confirmed_at')->nullable()->after('patient_confirmed_at');
            $table->timestamp('reminder_sent_at')->nullable()->after('doctor_confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'patient_token',
                'doctor_token',
                'patient_confirmed_at',
                'doctor_confirmed_at',
                'reminder_sent_at',
            ]);
        });
    }
};
