<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ParkingStatus;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ParkingLogResource;
use App\Models\Branch;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\ParkingTransaction;
use App\Models\Rate;
use App\Support\BranchContext;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ParkingLogController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
            'rate_id' => 'nullable|integer|exists:rates,id',
            'status' => 'nullable|string',
            'date' => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:1|max:100',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $branch = $this->apiBranch($request);
        $parkingLogs = ParkingLog::query()
            ->where('branch_id', $branch->id)
            ->with([
                'category:id,name',
                'rateDetail:id,name',
                'loggedBy:id,first_name,last_name',
                'transaction',
            ])
            ->when(
                $request->filled('search'),
                fn ($q) => $q->where(function ($subQuery) use ($request) {
                    $term = $request->input('search');
                    $subQuery->where('plate_number', 'like', "%{$term}%")
                        ->orWhere('uid', 'like', "%{$term}%");
                })
            )
            ->when(
                $request->filled('category_id'),
                fn ($q) => $q->where('category_id', $request->input('category_id'))
            )
            ->when(
                $request->filled('rate_id'),
                fn ($q) => $q->where('rate_id', $request->input('rate_id'))
            )
            ->when(
                $request->filled('status'),
                fn ($q) => $q->where('status', $request->input('status'))
            )
            ->when(
                $request->filled('date'),
                fn ($q) => $q->whereDate('time_in', $request->input('date'))
            )
            ->latest('time_in')
            ->paginate($request->input('per_page', 15));

        return ParkingLogResource::collection($parkingLogs);
    }

    public function show(Request $request, string $uid): ParkingLogResource
    {
        $parkingLog = ParkingLog::where('branch_id', $this->apiBranch($request)->id)
            ->where('uid', $uid)
            ->with([
                'category:id,name',
                'rateDetail:id,name',
                'loggedBy:id,first_name,last_name',
                'transaction',
            ])
            ->firstOrFail();

        return new ParkingLogResource($parkingLog);
    }

    public function destroy(Request $request, string $uid): JsonResponse
    {
        abort_if($request->user()->role === UserRole::Staff, 403);
        $parkingLog = ParkingLog::where('branch_id', $this->apiBranch($request)->id)
            ->where('uid', $uid)
            ->firstOrFail();

        $parkingLog->delete();

        return response()->json([
            'message' => 'Parking log deleted successfully.',
        ]);
    }

    public function apiCheckout(Request $request, string $uid): JsonResponse
    {
        $parkingLog = ParkingLog::with('rateDetail')
            ->where('branch_id', $this->apiBranch($request)->id)
            ->where('uid', $uid)
            ->firstOrFail();

        if ($parkingLog->status === ParkingStatus::Completed) {
            return response()->json([
                'message' => 'This parking ticket has already been checked out.',
            ], 422);
        }

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
        ]);

        $timeOut = now();

        $totalOwed = $this->calculateBilling($parkingLog, $timeOut);

        if ($validated['amount_paid'] < $totalOwed) {
            return response()->json([
                'message' => 'Amount paid cannot be less than the total owed (₱'.number_format($totalOwed, 2).').',
                'errors' => [
                    'amount_paid' => ['Insufficient payment amount provided.'],
                ],
            ], 422);
        }

        $changeDue = $validated['amount_paid'] - $totalOwed;

        logger()->info('Checkout debug', [
            'amount_paid' => $validated['amount_paid'],
            'totalOwed' => $totalOwed,
            'changeDue' => $changeDue,
        ]);

        $parkingLog->update([
            'time_out' => $timeOut,
            'status' => ParkingStatus::Completed,
        ]);

        $parkingLog->transaction()->create([
            'amount_paid' => $validated['amount_paid'],
            'change_due' => round($changeDue, 2),
            'payment_method' => $validated['payment_method'],
            'processed_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Vehicle checked out successfully.',
            'data' => [
                'parking_log' => $parkingLog->fresh(['transaction']),
                'total_owed' => round($totalOwed, 2),
                'change_due' => round($changeDue, 2),
            ],
        ], 200);
    }

    /**
     * Mirrors the web frontend's calculateBilling() logic exactly,
     * so mobile, API, and web all agree on the amount owed.
     */
    private function calculateBilling(ParkingLog $parkingLog, CarbonInterface $timeOut): float
    {
        $start = $parkingLog->time_in;
        $end = $timeOut;
        $unitPrice = (float) $parkingLog->rate;
        $rateType = strtolower($parkingLog->rateDetail?->name ?? 'Hourly');

        $units = match ($rateType) {
            'daily' => $start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1,

            'weekly' => (int) round(
                $start->copy()->startOfWeek(Carbon::SUNDAY)
                    ->diffInDays($end->copy()->startOfWeek(Carbon::SUNDAY)) / 7
            ) + 1,

            'monthly' => (($end->year - $start->year) * 12 + ($end->month - $start->month)) + 1,

            default => max(1, (int) ceil($start->diffInMinutes($end) / 60)),
        };

        return round($units * $unitPrice, 2);
    }

    public function apiAdminDashboard(Request $request): JsonResponse
    {
        abort_if($request->user()->role === UserRole::Staff, 403);
        $branch = $this->apiBranch($request);
        $today = now();

        $summary = [
            'today' => (float) ParkingTransaction::whereHas('parkingLog', fn ($query) => $query->where('branch_id', $branch->id))
                ->whereDate('created_at', $today)->sum('amount_paid'),
            'week' => (float) ParkingTransaction::whereHas('parkingLog', fn ($query) => $query->where('branch_id', $branch->id))
                ->whereBetween('created_at', [
                    $today->copy()->startOfWeek(),
                    $today->copy()->endOfWeek(),
                ])->sum('amount_paid'),
            'month' => (float) ParkingTransaction::whereHas('parkingLog', fn ($query) => $query->where('branch_id', $branch->id))
                ->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('amount_paid'),
            'activeCount' => ParkingLog::where('branch_id', $branch->id)->where('status', ParkingStatus::Active)->count(),
        ];

        $revenueTrend = collect(range(6, 0))->map(function ($daysAgo) use ($branch) {
            $date = now()->subDays($daysAgo)->toDateString();
            $total = ParkingTransaction::whereHas('parkingLog', fn ($query) => $query->where('branch_id', $branch->id))
                ->whereDate('created_at', $date)->sum('amount_paid');

            return [
                'date' => $date,
                'total' => (float) $total,
            ];
        })->values();

        $revenueByPaymentMethod = ParkingTransaction::query()
            ->whereHas('parkingLog', fn ($query) => $query->where('branch_id', $branch->id))
            ->selectRaw('payment_method, SUM(amount_paid) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'payment_method' => $row->payment_method->label(),
                'total' => (float) $row->total,
            ]);

        $revenueByCategory = ParkingTransaction::query()
            ->join('parking_logs', 'parking_logs.id', '=', 'parking_transactions.log_id')
            ->join('categories', 'categories.id', '=', 'parking_logs.category_id')
            ->where('parking_logs.branch_id', $branch->id)
            ->selectRaw('categories.name as category, SUM(parking_transactions.amount_paid) as total')
            ->groupBy('categories.name')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total,
            ]);

        return response()->json([
            'summary' => $summary,
            'revenueTrend' => $revenueTrend,
            'revenueByPaymentMethod' => $revenueByPaymentMethod,
            'revenueByCategory' => $revenueByCategory,
        ], 200);
    }

    public function categories()
    {
        return response()->json(Category::select('id', 'name')->get());
    }

    public function rates(Request $request)
    {
        $branch = $this->apiBranch($request);

        return response()->json(Rate::where('branch_id', $branch->id)
            ->whereNotNull('category_id')
            ->select('id', 'name', 'price', 'category_id')
            ->get());
    }

    public function statuses()
    {
        return response()->json(
            array_map(fn ($status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ], ParkingStatus::cases())
        );
    }

    private function apiBranch(Request $request): Branch
    {
        $branchId = $request->input('branch_id');
        $branches = BranchContext::accessibleTo($request->user());
        $branch = $branchId
            ? $branches->firstWhere('id', (int) $branchId)
            : $branches->first();

        abort_unless($branch !== null, 403, 'No branch is assigned to this account.');

        return $branch;
    }
}
