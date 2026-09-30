<?php

namespace App\Http\Controllers;

use App\Enums\ParkingStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\ParkingLog;
use App\Models\ParkingTransaction;
use App\Support\BranchContext;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $branch = BranchContext::active($request);

        $branches = BranchContext::accessibleTo($user);

        if ($user->role === UserRole::Staff) {
            $branchLogs = fn () => ParkingLog::where('branch_id', $branch->id);

            return Inertia::render('user-dashboard', [
                'activeBranch' => ['id' => $branch->id, 'name' => $branch->name],
                'branchSummary' => $branches->map(fn (Branch $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'activeCount' => ParkingLog::where('branch_id', $item->id)
                        ->where('status', ParkingStatus::Active)
                        ->count(),
                ])->values(),
                'newcomers' => $branchLogs()->whereDate('time_in', today())
                    ->latest('time_in')->limit(10)->get(['id', 'plate_number', 'time_in']),
                'latestCheckouts' => $branchLogs()->whereDate('time_out', today())
                    ->latest('time_out')->limit(10)->get(['id', 'plate_number', 'time_out']),
            ]);
        }

        return $this->dashboard($branch, $branches);
    }

    /**
     * @param  Collection<int, Branch>  $branches
     */
    protected function dashboard(Branch $activeBranch, Collection $branches): Response
    {
        $branchLog = ParkingLog::where('branch_id', $activeBranch->id);
        $transaction = ParkingTransaction::query()
            ->whereHas('parkingLog', fn ($query) => $query->where('branch_id', $activeBranch->id));

        $today = now();
        $summary = [
            'today' => (float) (clone $transaction)->whereDate('created_at', $today)->sum('amount_paid'),
            'week' => (float) (clone $transaction)->whereBetween('created_at', [
                $today->copy()->startOfWeek(),
                $today->copy()->endOfWeek(),
            ])->sum('amount_paid'),
            'month' => (float) (clone $transaction)->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('amount_paid'),
            'activeCount' => (clone $branchLog)->where('status', ParkingStatus::Active)->count(),
        ];

        $revenueTrend = collect(range(6, 0))->map(function ($daysAgo) use ($activeBranch) {
            $date = now()->subDays($daysAgo)->toDateString();

            return [
                'date' => $date,
                'total' => (float) ParkingTransaction::whereHas(
                    'parkingLog',
                    fn ($query) => $query->where('branch_id', $activeBranch->id)
                )->whereDate('created_at', $date)->sum('amount_paid'),
            ];
        })->values()->all();

        $revenueByPaymentMethod = (clone $transaction)
            ->selectRaw('payment_method, SUM(amount_paid) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'payment_method' => $row->payment_method->label(),
                'total' => (float) $row->total,
            ])
            ->values()
            ->all();

        $revenueByCategory = (clone $transaction)
            ->join('parking_logs', 'parking_logs.id', '=', 'parking_transactions.log_id')
            ->join('categories', 'categories.id', '=', 'parking_logs.category_id')
            ->selectRaw('categories.name as category, SUM(parking_transactions.amount_paid) as total')
            ->groupBy('categories.name')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total,
            ])
            ->values()
            ->all();

        $branchSummary = $branches->map(function (Branch $branch) use ($today) {
            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'today' => (float) ParkingTransaction::whereHas(
                    'parkingLog',
                    fn ($query) => $query->where('branch_id', $branch->id)
                )->whereDate('created_at', $today)->sum('amount_paid'),
                'activeCount' => ParkingLog::where('branch_id', $branch->id)
                    ->where('status', ParkingStatus::Active)
                    ->count(),
            ];
        })->values();

        return Inertia::render('dashboard', [
            'activeBranch' => ['id' => $activeBranch->id, 'name' => $activeBranch->name],
            'summary' => $summary,
            'revenueTrend' => $revenueTrend,
            'revenueByPaymentMethod' => $revenueByPaymentMethod,
            'revenueByCategory' => $revenueByCategory,
            'branchSummary' => $branchSummary,
            'newcomers' => (clone $branchLog)->whereDate('time_in', today())
                ->latest('time_in')
                ->limit(10)
                ->get(['id', 'plate_number', 'time_in']),
            'latestCheckouts' => (clone $branchLog)->whereDate('time_out', today())
                ->latest('time_out')
                ->limit(10)
                ->get(['id', 'plate_number', 'time_out']),
        ]);
    }
}
