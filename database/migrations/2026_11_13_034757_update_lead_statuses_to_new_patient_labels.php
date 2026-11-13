<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('leads')->where('status', 'New')->update(['status' => 'New patients']);
        DB::table('leads')->where('status', 'Contacted')->update(['status' => 'Contacted patients']);
        DB::table('leads')->where('status', 'Treatment Plan Sent')->update(['status' => 'Follow up patients']);
        DB::table('leads')->where('status', 'Won')->update(['status' => 'Confirmed patients']);
        DB::table('leads')->where('status', 'Lost')->update(['status' => 'Reschedule']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('leads')->where('status', 'New patients')->update(['status' => 'New']);
        DB::table('leads')->where('status', 'Contacted patients')->update(['status' => 'Contacted']);
        DB::table('leads')->where('status', 'Follow up patients')->update(['status' => 'Treatment Plan Sent']);
        DB::table('leads')->where('status', 'Confirmed patients')->update(['status' => 'Won']);
        DB::table('leads')->where('status', 'Reschedule')->update(['status' => 'Lost']);
    }
};
