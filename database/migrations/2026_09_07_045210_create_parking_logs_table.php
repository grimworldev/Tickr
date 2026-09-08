<?php

use App\Enums\ParkingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parking_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uid')->unique();
            $table->string('plate_number')->index();
            $table->foreignId('category_id')->constrained();
            $table->foreignId('rate_id')->constrained();
            $table->decimal('rate', 8, 2);
            $table->timestamp('time_in');
            $table->timestamp('time_out')->nullable();
            $table->string('status')->default(ParkingStatus::Active->value);
            $table->foreignId('logged_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parking_logs');
    }
};