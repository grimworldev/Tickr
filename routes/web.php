<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParkingLogController;
use App\Http\Controllers\RateController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::resource('rates', RateController::class);
    Route::resource('parking-logs', ParkingLogController::class)->except(['update']);
    Route::post('parking-logs/{parking_log}/checkout', [ParkingLogController::class, 'checkout'])->name('parking-logs.checkout');
});

require __DIR__ . '/settings.php';