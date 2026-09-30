<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        $now = now();
        $defaultBranchId = DB::table('branches')->insertGetId([
            'name' => 'Main Branch',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Schema::create('branch_user', function (Blueprint $table) {
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['branch_id', 'user_id']);
        });

        DB::table('branch_user')->insertUsing(
            ['branch_id', 'user_id'],
            DB::table('users')->selectRaw('? as branch_id, id as user_id', [$defaultBranchId])
        );

        Schema::table('rates', function (Blueprint $table) {
            $table->dropUnique('rates_name_unique');
            $table->foreignId('branch_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('parking_logs', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->constrained()->cascadeOnDelete();
        });

        DB::table('parking_logs')->update(['branch_id' => $defaultBranchId]);

        $legacyRates = DB::table('rates')->get();
        $categories = DB::table('categories')->get();

        foreach ($legacyRates as $legacyRate) {
            DB::table('rates')
                ->where('id', $legacyRate->id)
                ->update(['branch_id' => $defaultBranchId]);

            foreach ($categories as $category) {
                $categoryRateId = DB::table('rates')->insertGetId([
                    'name' => $legacyRate->name,
                    'price' => $legacyRate->price,
                    'branch_id' => $defaultBranchId,
                    'category_id' => $category->id,
                    'created_at' => $legacyRate->created_at,
                    'updated_at' => $legacyRate->updated_at,
                    'deleted_at' => $legacyRate->deleted_at,
                ]);

                DB::table('parking_logs')
                    ->where('branch_id', $defaultBranchId)
                    ->where('category_id', $category->id)
                    ->where('rate_id', $legacyRate->id)
                    ->update(['rate_id' => $categoryRateId]);
            }
        }

        Schema::table('rates', function (Blueprint $table) {
            $table->unique(['branch_id', 'category_id', 'name']);
        });
    }

    public function down(): void
    {
        $rateGroups = DB::table('rates')
            ->select('name')
            ->groupBy('name')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($rateGroups as $rateGroup) {
            $rateIds = DB::table('rates')
                ->where('name', $rateGroup->name)
                ->orderBy('id')
                ->pluck('id');
            $retainedRateId = $rateIds->first();
            $duplicateRateIds = $rateIds->slice(1);

            DB::table('parking_logs')
                ->whereIn('rate_id', $duplicateRateIds)
                ->update(['rate_id' => $retainedRateId]);
            DB::table('rates')->whereIn('id', $duplicateRateIds)->delete();
        }

        Schema::table('rates', function (Blueprint $table) {
            $table->dropUnique(['branch_id', 'category_id', 'name']);
            $table->dropConstrainedForeignId('category_id');
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::table('parking_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::dropIfExists('branch_user');
        Schema::dropIfExists('branches');

        Schema::table('rates', function (Blueprint $table) {
            $table->unique('name');
        });
    }
};
