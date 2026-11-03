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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('patient_name');
            $table->string('patient_email');
            $table->string('patient_phone');
            $table->string('service');
            $table->string('doctor');
            $table->string('date');
            $table->string('time');
            $table->string('status')->default('Pending');
            $table->string('type')->default('Initial Consultation');
            $table->string('room')->nullable();
            $table->string('duration')->default('45 mins');
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('source')->default('Website Booking');
            $table->string('requested_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('doctor');
            $table->index('date');
            $table->index(['doctor', 'date', 'time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
