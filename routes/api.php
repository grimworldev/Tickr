<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\V1\ParkingLogController;

// Public Auth Routes (/api/auth/*)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected Auth Routes (Requires Sanctum Token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::prefix('v1')->group(function () {
    // Protected API Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/parking-logs', [ParkingLogController::class, 'index']);
        Route::get('/parking-logs/{uid}', [ParkingLogController::class, 'show']);
        Route::post('/parking-logs/{uid}/checkout', [ParkingLogController::class, 'apiCheckout']);
        Route::delete('/parking-logs/{parkingLog}', [ParkingLogController::class, 'destroy']);
        Route::get('/admin/dashboard', [ParkingLogController::class, 'apiAdminDashboard']);

        Route::get('/categories', [ParkingLogController::class, 'categories']);
        Route::get('/rates', [ParkingLogController::class, 'rates']);
        Route::get('/statuses', [ParkingLogController::class, 'statuses']);
    }); 
});