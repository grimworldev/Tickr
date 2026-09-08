<?php

namespace App\Http\Controllers;

use App\Enums\ParkingStatus;
use App\Enums\UserRole;
use App\Models\ParkingLog;
use App\Models\ParkingTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard, tailored to the authenticated user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return $user->role === UserRole::Administrator
            ? $this->adminDashboard()
            : $this->staffDashboard();
    }

    /**
     * Financial overview: revenue summary, trend, and breakdowns.
     */
    protected function adminDashboard(): Response
    {
        $today = now();

        $summary = [
            'today' => (float) ParkingTransaction::whereDate('created_at', $today)->sum('amount_paid'),
            'week' => (float) ParkingTransaction::whereBetween('created_at', [
                $today->copy()->startOfWeek(),
                $today->copy()->endOfWeek(),
            ])->sum('amount_paid'),
            'month' => (float) ParkingTransaction::whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('amount_paid'),
            'activeCount' => ParkingLog::where('status', ParkingStatus::Active)->count(),
        ];

        $revenueTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->toDateString();
            $total = ParkingTransaction::whereDate('created_at', $date)->sum('amount_paid');

            return ['date' => $date, 'total' => (float) $total];
        })->values();

        $revenueByPaymentMethod = ParkingTransaction::query()
            ->selectRaw('payment_method, SUM(amount_paid) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn($row) => [
                'payment_method' => $row->payment_method->label(),
                'total' => (float) $row->total,
            ]);

        $revenueByCategory = ParkingTransaction::query()
            ->join('parking_logs', 'parking_logs.id', '=', 'parking_transactions.log_id')
            ->join('categories', 'categories.id', '=', 'parking_logs.category_id')
            ->selectRaw('categories.name as category, SUM(parking_transactions.amount_paid) as total')
            ->groupBy('categories.name')
            ->get();

        return Inertia::render('dashboard', [
            'summary' => $summary,
            'revenueTrend' => $revenueTrend,
            'revenueByPaymentMethod' => $revenueByPaymentMethod,
            'revenueByCategory' => $revenueByCategory,
        ]);
    }

    /**
     * Operational overview: today's arrivals and latest checkouts.
     */
    protected function staffDashboard(): Response
    {
        return Inertia::render('user-dashboard', [
            'newcomers' => ParkingLog::whereDate('time_in', today())
                ->latest('time_in')
                ->limit(10)
                ->get(['id', 'plate_number', 'time_in']),
            'latestCheckouts' => ParkingLog::whereDate('time_out', today())
                ->latest('time_out')
                ->limit(10)
                ->get(['id', 'plate_number', 'time_out']),
        ]);
    }
}