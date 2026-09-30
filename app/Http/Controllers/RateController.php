<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Rate;
use App\Support\BranchContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $branch = BranchContext::active($request);
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        return Inertia::render('rates/index', [
            'rates' => Rate::query()
                ->with('category:id,name')
                ->where('branch_id', $branch->id)
                ->whereNotNull('category_id')
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $branch = BranchContext::active($request);
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $request->validate([
            'name' => [
                Rule::unique('rates', 'name')
                    ->where('branch_id', $branch->id)
                    ->where('category_id', $validated['category_id']),
            ],
        ]);

        Rate::create([...$validated, 'branch_id' => $branch->id]);

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate created successfully.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rate $rate) {}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rate $rate) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rate $rate): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $branch = BranchContext::active($request);
        abort_unless($rate->branch_id === $branch->id && $rate->category_id, 404);
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $request->validate([
            'name' => [
                Rule::unique('rates', 'name')
                    ->where('branch_id', $branch->id)
                    ->where('category_id', $validated['category_id'])
                    ->ignore($rate->id),
            ],
        ]);

        $rate->update($validated);

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate updated successfully.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rate $rate): RedirectResponse
    {
        abort_unless(request()->user()->canManageBranchSettings(), 403);
        abort_unless($rate->branch_id === BranchContext::active(request())->id && $rate->category_id, 404);
        $rate->delete();

        return redirect()->route('rates.index')->with('toast', ['type' => 'success', 'message' => 'Rate deleted.']);
    }
}
