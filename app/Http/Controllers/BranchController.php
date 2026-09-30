<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Support\BranchContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin(), 403);

        return Inertia::render('branches/index', [
            'branches' => Branch::query()->withCount(['users', 'parkingLogs'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('branches', 'name')],
        ]);

        Branch::create($validated);

        return redirect()->route('branches.index')
            ->with('toast', ['type' => 'success', 'message' => 'Branch created successfully.']);
    }

    public function switch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
        ]);

        $branch = BranchContext::accessibleTo($request->user())
            ->firstWhere('id', (int) $validated['branch_id']);
        abort_unless($branch !== null, 403);

        $request->session()->put('active_branch_id', $branch->id);

        return back();
    }
}
