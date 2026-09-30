<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use App\Support\BranchContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $allowedPerPage = [25, 50, 75, 100];
        $perPage = (int) $request->input('per_page', 25);

        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $branches = BranchContext::accessibleTo($request->user());
        $users = User::query()
            ->with('branches:id,name')
            ->when(! $request->user()->isAdmin(), function ($query) use ($branches) {
                $query->whereHas('branches', fn ($branchQuery) => $branchQuery->whereIn('branches.id', $branches->modelKeys()))
                    ->whereDoesntHave('branches', fn ($branchQuery) => $branchQuery->whereNotIn('branches.id', $branches->modelKeys()))
                    ->where('role', '!=', UserRole::Administrator->value);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'branches' => $branches->map(fn (Branch $branch) => ['id' => $branch->id, 'name' => $branch->name])->values(),
            'filters' => $request->only(['per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $data = $this->validatedUserData($request);
        $branchIds = $data['branch_ids'] ?? [];
        unset($data['branch_ids']);

        $user = User::create($data);

        if ($user->role !== UserRole::Administrator) {
            $user->branches()->sync($branchIds);
        }

        return redirect()->route('users.index')->with('toast', ['type' => 'success', 'message' => 'User created successfully.']);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        $this->authorizeManagedUser($request, $user);
        $validated = $this->validatedUserData($request, $user);
        $branchIds = $validated['branch_ids'] ?? [];
        unset($validated['branch_ids']);

        // Only touch the password if a new one was actually provided.
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);
        if ($user->role !== UserRole::Administrator) {
            $user->branches()->sync($branchIds);
        }

        return redirect()->route('users.index')->with('toast', ['type' => 'success', 'message' => 'User updated successfully.']);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->canManageBranchSettings(), 403);
        abort_unless($request->user()->id !== $user->id, 403);
        $this->authorizeManagedUser($request, $user);
        $user->delete();

        return redirect()->route('users.index')->with('toast', ['type' => 'success', 'message' => 'User deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedUserData(Request $request, ?User $user = null): array
    {
        $actor = $request->user();
        $isAdmin = $actor->isAdmin();
        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user?->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => [$user ? 'nullable' : 'required', 'string', Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class)],
            'branch_ids' => [$isAdmin ? 'nullable' : 'required', 'array'],
            'branch_ids.*' => ['integer', 'distinct', Rule::exists('branches', 'id')],
        ];

        $validated = $request->validate($rules);
        $role = UserRole::from((int) $validated['role']);
        $branchIds = $validated['branch_ids'] ?? [];

        if (! $isAdmin) {
            abort_unless(in_array($role, [UserRole::User, UserRole::Staff], true), 403);
            $accessibleIds = BranchContext::accessibleTo($actor)->modelKeys();
            abort_if(array_diff($branchIds, $accessibleIds), 403);
        } elseif ($role !== UserRole::Administrator) {
            $request->validate(['branch_ids' => ['required', 'array', 'min:1']]);
        }

        return $validated;
    }

    private function authorizeManagedUser(Request $request, User $user): void
    {
        if ($request->user()->isAdmin()) {
            return;
        }

        $accessibleIds = BranchContext::accessibleTo($request->user())->modelKeys();
        abort_unless(
            $user->role !== UserRole::Administrator
                && $user->branches()->whereIn('branches.id', $accessibleIds)->exists()
                && $user->branches()->whereNotIn('branches.id', $accessibleIds)->doesntExist(),
            403
        );
    }
}
