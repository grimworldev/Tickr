<?php

namespace App\Http\Controllers;

use App\Enums\ParkingStatus;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\Rate;
use App\Support\BranchContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ParkingLogController extends Controller
{
    public function index(Request $request): Response
    {
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $branch = BranchContext::active($request);
        $parkingLogs = ParkingLog::query()
            ->where('branch_id', $branch->id)
            ->select(['id', 'uid', 'plate_number', 'branch_id', 'category_id', 'rate_id', 'rate', 'time_in', 'time_out', 'status', 'logged_by'])
            ->with([
                'category:id,name',
                'rateDetail:id,name',
                'loggedBy:id,first_name,last_name',
                'transaction:id,log_id,amount_paid,change_due,payment_method,created_at',
            ])
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->input('category_id')))
            ->when($request->filled('rate_id'), fn ($q) => $q->where('rate_id', $request->input('rate_id')))
            ->when(
                $request->filled('status'),
                fn ($q) => $q->where('status', $request->input('status')),
                fn ($q) => $q->where('status', '!=', 'Completed'),
            )
            ->when($request->filled('date'), fn ($q) => $q->whereDate('time_in', $request->input('date')))
            ->latest('time_in')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('parking-logs/index', [
            'parkingLogs' => $parkingLogs,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'rates' => Rate::query()
                ->where('branch_id', $branch->id)
                ->whereNotNull('category_id')
                ->get(['id', 'name', 'price', 'category_id']),
            'filters' => $request->only(['category_id', 'rate_id', 'status', 'date', 'per_page']),
        ]);
    }

    public function create() {}

    public function store(Request $request): RedirectResponse
    {
        $branch = BranchContext::active($request);
        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:20'],
            'category_id' => ['required', 'exists:categories,id'],
            'rate_id' => [
                'required',
                'integer',
                Rule::exists('rates', 'id')
                    ->where('branch_id', $branch->id)
                    ->where('category_id', $request->input('category_id'))
                    ->whereNull('deleted_at'),
            ],
        ]);

        $rate = Rate::where('branch_id', $branch->id)->findOrFail($validated['rate_id']);

        ParkingLog::create([
            ...$validated,
            'branch_id' => $branch->id,
            'rate' => $rate->price,
            'time_in' => now(),
            'status' => ParkingStatus::Active,
            'logged_by' => $request->user()->id,
        ]);

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle logged in successfully.']);
    }

    public function show(Request $request, $uid): Response
    {
        $parkingLog = ParkingLog::where('branch_id', BranchContext::active($request)->id)
            ->where('uid', $uid)
            ->firstOrFail();

        $parkingLog->load(['category', 'rateDetail', 'loggedBy', 'transaction']);

        return Inertia::render('parking-logs/show', [
            'parkingLog' => $parkingLog,
        ]);
    }

    public function destroy(Request $request, $uid): RedirectResponse
    {
        abort_if($request->user()->role === UserRole::Staff, 403);
        $parkingLog = ParkingLog::where('branch_id', BranchContext::active($request)->id)
            ->where('uid', $uid)
            ->firstOrFail();
        $parkingLog->delete();

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Parking log deleted.']);
    }

    public function checkout(Request $request, $uid): RedirectResponse
    {
        $parkingLog = ParkingLog::where('branch_id', BranchContext::active($request)->id)
            ->where('uid', $uid)
            ->firstOrFail();

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
        ]);

        $billing = $parkingLog->calculateBillingTotal();

        if ($validated['amount_paid'] < $billing['total']) {
            return back()->withErrors([
                'amount_paid' => "Amount paid cannot be less than the total due (₱{$billing['total']}).",
            ]);
        }

        $parkingLog->update([
            'time_out' => now(),
            'status' => ParkingStatus::Completed,
        ]);

        $parkingLog->transaction()->create([
            'amount_paid' => $validated['amount_paid'],
            'change_due' => $validated['amount_paid'] - $billing['total'],
            'payment_method' => $validated['payment_method'],
            'processed_by' => $request->user()->id,
        ]);

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle checked out successfully.']);
    }
}
