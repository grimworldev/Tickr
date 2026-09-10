<?php

namespace App\Http\Controllers;

use App\Enums\ParkingStatus;
use App\Enums\PaymentMethod;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\Rate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ParkingLogController extends Controller
{
    public function index(Request $request): Response
    {
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $parkingLogs = ParkingLog::query()
            ->select(['id', 'uid', 'plate_number', 'category_id', 'rate_id', 'rate', 'time_in', 'time_out', 'status', 'logged_by'])
            ->with([
                'category:id,name',
                'rateDetail:id,name',
                'loggedBy:id,first_name,last_name',
                'transaction:id,log_id,amount_paid,change_due,payment_method,created_at',
            ])
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->input('category_id')))
            ->when($request->filled('rate_id'), fn($q) => $q->where('rate_id', $request->input('rate_id')))
            ->when(
                $request->filled('status'),
                fn($q) => $q->where('status', $request->input('status')),
                fn($q) => $q->where('status', '!=', 'Completed'),
            )
            ->when($request->filled('date'), fn($q) => $q->whereDate('time_in', $request->input('date')))
            ->latest('time_in')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('parking-logs/index', [
            'parkingLogs' => $parkingLogs,
            'categories' => Cache::remember('categories.all', now()->addHour(), fn() => Category::all()->values()->toArray()),
            'rates' => Cache::remember('rates.all', now()->addHour(), fn() => Rate::all()->values()->toArray()),
            'filters' => $request->only(['category_id', 'rate_id', 'status', 'date', 'per_page']),
        ]);
    }

    public function create()
    {
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:20'],
            'category_id' => ['required', 'exists:categories,id'],
            'rate_id' => ['required', 'exists:rates,id'],
        ]);

        $rate = Rate::findOrFail($validated['rate_id']);

        ParkingLog::create([
            ...$validated,
            'rate' => $rate->price,
            'time_in' => now(),
            'status' => ParkingStatus::Active,
            'logged_by' => $request->user()->id,
        ]);

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle logged in successfully.']);
    }

    public function show($uid): Response
    {
        $parkingLog = ParkingLog::where('uid', $uid)->firstOrFail();

        $parkingLog->load(['category', 'rateDetail', 'loggedBy', 'transaction']);

        return Inertia::render('parking-logs/show', [
            'parkingLog' => $parkingLog,
        ]);
    }

    public function destroy($uid): RedirectResponse
    {
        $parkingLog = ParkingLog::where('uid', $uid)->firstOrFail();
        $parkingLog->delete();

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Parking log deleted.']);
    }

    public function checkout(Request $request, $uid): RedirectResponse
    {
        $parkingLog = ParkingLog::where('uid', $uid)->firstOrFail();

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
        ]);

        if ($validated['amount_paid'] < $parkingLog->rate) {
            return back()->withErrors([
                'amount_paid' => 'Amount paid cannot be less than the rate owed.',
            ]);
        }

        $parkingLog->update([
            'time_out' => now(),
            'status' => ParkingStatus::Completed,
        ]);

        $parkingLog->transaction()->create([
            'amount_paid' => $validated['amount_paid'],
            'change_due' => $validated['amount_paid'] - $parkingLog->rate,
            'payment_method' => $validated['payment_method'],
            'processed_by' => $request->user()->id,
        ]);

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle checked out successfully.']);
    }
}