<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ParkingLogController;
use App\Http\Controllers\RateController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('categories', CategoryController::class);
    Route::resource('rates', RateController::class);
    Route::resource('parking-logs', ParkingLogController::class);
});

require __DIR__ . '/settings.php';
