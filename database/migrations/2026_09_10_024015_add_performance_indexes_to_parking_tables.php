<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parking_logs', function (Blueprint $table) {
            $table->index('status');
            $table->index('time_in');
            $table->index(['status', 'time_in']); // composite: "active tickets sorted by time_in"
        });

        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('parking_logs', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['time_in']);
            $table->dropIndex(['status', 'time_in']);
        });

        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['payment_method']);
        });
    }
};