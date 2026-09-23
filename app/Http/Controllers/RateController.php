<?php

namespace App\Http\Controllers;

use App\Models\Rate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        return Inertia::render('rates/index', [
            'rates' => Rate::query()->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:rates,name'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        Rate::create($validated);

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate created successfully.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rate $rate)
    {
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rate $rate)
    {
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rate $rate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:rates,name,' . $rate->id],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $rate->update($validated);

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rate $rate): RedirectResponse
    {
        $rate->delete();

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate deleted.']);
    }
}