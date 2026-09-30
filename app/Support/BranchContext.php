<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BranchContext
{
    /**
     * @return Collection<int, Branch>
     */
    public static function accessibleTo(User $user): Collection
    {
        return $user->role === UserRole::Administrator
            ? Branch::query()->orderBy('name')->get()
            : $user->branches()->orderBy('name')->get();
    }

    public static function active(Request $request): Branch
    {
        $user = $request->user();
        abort_unless($user, 403);

        $branches = self::accessibleTo($user);
        $activeBranch = $branches->firstWhere('id', (int) $request->session()->get('active_branch_id'));

        if ($activeBranch !== null) {
            return $activeBranch;
        }

        $activeBranch = $branches->first();
        abort_unless($activeBranch !== null, 403, 'No branch is assigned to this account.');

        $request->session()->put('active_branch_id', $activeBranch->id);

        return $activeBranch;
    }
}
