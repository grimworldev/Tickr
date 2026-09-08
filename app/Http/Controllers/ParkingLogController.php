<?php

namespace App\Http\Controllers;

use App\Enums\ParkingStatus;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\Rate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParkingLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('parking-logs/index', [
            'parkingLogs' => ParkingLog::query()
                ->with(['category', 'rateDetail', 'loggedBy'])
                ->latest('time_in')
                ->paginate(10),
            'categories' => Category::all(),
            'rates' => Rate::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('parking-logs/create', [
            'categories' => Category::all(),
            'rates' => Rate::all(),
        ]);
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

    public function show(ParkingLog $parkingLog): Response
    {
        return Inertia::render('parking-logs/show', [
            'parkingLog' => $parkingLog->load(['category', 'rateDetail', 'loggedBy', 'transaction']),
        ]);
    }

    public function edit(ParkingLog $parkingLog): Response
    {
        return Inertia::render('parking-logs/edit', [
            'parkingLog' => $parkingLog,
        ]);
    }

    public function update(Request $request, ParkingLog $parkingLog): RedirectResponse
    {
        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,gcash,maya,card'],
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

    public function destroy(ParkingLog $parkingLog): RedirectResponse
    {
        $parkingLog->delete();

        return redirect()->route('parking-logs.index')->with('toast', ['type' => 'success', 'message' => 'Parking log deleted.']);
    }
}