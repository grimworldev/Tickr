<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Support\BranchContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        return Inertia::render('categories/index', [
            'categories' => Category::query()
                ->with(['rates' => fn ($query) => $query->where('branch_id', BranchContext::active($request)->id)])
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        abort_unless(request()->user()->canManageBranchSettings(), 403);

        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
        ]);

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('toast', ['type' => 'success', 'message' => 'Category created successfully.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): Response
    {
        abort_unless(request()->user()->canManageBranchSettings(), 403);

        return Inertia::render('categories/show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response
    {
        abort_unless(request()->user()->canManageBranchSettings(), 403);

        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,'.$category->id],
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        abort_unless(request()->user()->canManageBranchSettings(), 403);
        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
