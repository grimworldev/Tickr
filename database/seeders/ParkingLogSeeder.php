<?php

namespace Database\Seeders;

use App\Enums\ParkingStatus;
use App\Models\Category;
use App\Models\ParkingLog;
use App\Models\Rate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ParkingLogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $rates = Rate::all();
        $users = User::all();

        if ($categories->isEmpty() || $rates->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Seed categories, rates, and users first — skipping parking logs.');
            return;
        }

        // Spread 150 tickets across the last 90 days for realistic daily/weekly/monthly report data.
        for ($i = 0; $i < 150; $i++) {
            $category = $categories->random();
            $rate = $rates->random();
            $user = $users->random();

            $timeIn = Carbon::now()
                ->subDays(rand(0, 90))
                ->setTime(rand(6, 22), collect([0, 15, 30, 45])->random());

            ParkingLog::create([
                'plate_number' => $this->randomPlate(),
                'category_id' => $category->id,
                'rate_id' => $rate->id,
                'rate' => $rate->price,
                'time_in' => $timeIn,
                'time_out' => null,
                'status' => ParkingStatus::Active,
                'logged_by' => $user->id,
            ]);
        }

        $this->command->info('Seeded 150 active parking logs with dates spread across the last 90 days.');
    }

    protected function randomPlate(): string
    {
        $letters = strtoupper(collect(range('a', 'z'))->random(3)->implode(''));
        $numbers = rand(1000, 9999);

        return "{$letters} {$numbers}";
    }
}