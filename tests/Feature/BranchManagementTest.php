<?php

use App\Enums\ParkingStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\Rate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeBranchTestUser(UserRole $role): User
{
    $user = User::create([
        'first_name' => 'Branch',
        'last_name' => 'Tester',
        'username' => fake()->unique()->userName(),
        'email' => fake()->unique()->safeEmail(),
        'password' => 'password',
        'role' => $role,
    ]);

    $user->forceFill(['email_verified_at' => now()])->save();

    return $user;
}

test('administrators can create branches and branch managers cannot', function () {
    $admin = makeBranchTestUser(UserRole::Administrator);
    $manager = makeBranchTestUser(UserRole::User);

    $this->actingAs($admin)
        ->post(route('branches.store'), ['name' => 'Airport'])
        ->assertRedirect(route('branches.index'));

    $this->actingAs($manager)
        ->post(route('branches.store'), ['name' => 'Unauthorized'])
        ->assertForbidden();

    $this->assertDatabaseHas('branches', ['name' => 'Airport']);
    $this->assertDatabaseMissing('branches', ['name' => 'Unauthorized']);
});

test('staff can only view and log vehicles for their assigned branch', function () {
    $staff = makeBranchTestUser(UserRole::Staff);
    $mainBranch = $staff->branches()->firstOrFail();
    $otherBranch = Branch::create(['name' => 'Airport']);
    $category = Category::create(['name' => 'Car']);
    $mainRate = Rate::create([
        'name' => 'Hourly',
        'price' => 50,
        'branch_id' => $mainBranch->id,
        'category_id' => $category->id,
    ]);
    $otherRate = Rate::create([
        'name' => 'Hourly',
        'price' => 75,
        'branch_id' => $otherBranch->id,
        'category_id' => $category->id,
    ]);

    $visibleLog = ParkingLog::create([
        'plate_number' => 'ABC-1234',
        'branch_id' => $mainBranch->id,
        'category_id' => $category->id,
        'rate_id' => $mainRate->id,
        'rate' => $mainRate->price,
        'time_in' => now(),
        'status' => ParkingStatus::Active,
        'logged_by' => $staff->id,
    ]);

    ParkingLog::create([
        'plate_number' => 'XYZ-9876',
        'branch_id' => $otherBranch->id,
        'category_id' => $category->id,
        'rate_id' => $otherRate->id,
        'rate' => $otherRate->price,
        'time_in' => now(),
        'status' => ParkingStatus::Active,
        'logged_by' => $staff->id,
    ]);

    $this->actingAs($staff)
        ->get(route('parking-logs.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('parking-logs/index')
            ->has('parkingLogs.data', 1)
            ->where('parkingLogs.data.0.uid', $visibleLog->uid)
        );

    $this->actingAs($staff)
        ->post(route('parking-logs.store'), [
            'plate_number' => 'DEF-5678',
            'category_id' => $category->id,
            'rate_id' => $otherRate->id,
        ])
        ->assertSessionHasErrors('rate_id');

    $this->assertDatabaseMissing('parking_logs', ['plate_number' => 'DEF-5678']);

    $this->actingAs($staff)->get(route('rates.index'))->assertForbidden();
    $this->actingAs($staff)->delete(route('parking-logs.destroy', $visibleLog->uid))->assertForbidden();
});

test('branch managers keep category rates separate across their assigned branches', function () {
    $manager = makeBranchTestUser(UserRole::User);
    $mainBranch = $manager->branches()->firstOrFail();
    $secondBranch = Branch::create(['name' => 'Uptown']);
    $manager->branches()->attach($secondBranch);
    $category = Category::create(['name' => 'Motorcycle']);

    foreach ([[$mainBranch, 40], [$secondBranch, 65]] as [$branch, $price]) {
        Rate::create([
            'name' => 'Hourly',
            'price' => $price,
            'branch_id' => $branch->id,
            'category_id' => $category->id,
        ]);
    }

    $this->actingAs($manager)
        ->withSession(['active_branch_id' => $mainBranch->id])
        ->get(route('rates.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('rates/index')
            ->has('rates.data', 1)
            ->where('rates.data.0.price', '40.00')
        );

    $this->actingAs($manager)
        ->post(route('branches.switch'), ['branch_id' => $secondBranch->id])
        ->assertRedirect();

    $this->get(route('rates.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('rates/index')
            ->has('rates.data', 1)
            ->where('rates.data.0.price', '65.00')
        );
});

test('the API dashboard uses the authorized selected branch', function () {
    $manager = makeBranchTestUser(UserRole::User);
    $assignedBranch = Branch::create(['name' => 'Harbor']);
    $manager->branches()->attach($assignedBranch);
    $otherBranch = Branch::create(['name' => 'Hilltop']);

    $this->actingAs($manager, 'sanctum')
        ->getJson('/api/v1/admin/dashboard?branch_id='.$assignedBranch->id)
        ->assertOk()
        ->assertJsonStructure(['summary', 'revenueTrend', 'revenueByPaymentMethod', 'revenueByCategory']);

    $this->getJson('/api/v1/admin/dashboard?branch_id='.$otherBranch->id)->assertForbidden();
});
