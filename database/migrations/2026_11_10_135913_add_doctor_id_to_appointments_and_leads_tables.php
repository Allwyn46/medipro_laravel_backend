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
            $table->foreignId('doctor_id')
                ->nullable()
                ->after('service')
                ->constrained('doctors')
                ->nullOnDelete();

            $table->index('doctor_id');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('doctor_id')
                ->nullable()
                ->after('payment_status')
                ->constrained('doctors')
                ->nullOnDelete();

            $table->index('doctor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
            $table->dropColumn('doctor_id');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
            $table->dropColumn('doctor_id');
        });
    }
};
