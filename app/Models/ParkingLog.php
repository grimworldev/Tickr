<?php

namespace App\Models;

use App\Enums\ParkingStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['plate_number', 'category_id', 'rate_id', 'rate', 'time_in', 'time_out', 'status', 'logged_by'])]
class ParkingLog extends Model
{
    use HasFactory, HasUuids;

    public function uniqueIds(): array
    {
        return ['uid'];
    }

    protected function casts(): array
    {
        return [
            'time_in' => 'datetime',
            'time_out' => 'datetime',
            'status' => ParkingStatus::class,
            'rate' => 'decimal:2',
        ];
    }
    public function getRouteKeyName(): string
    {
        return 'uid';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function rateDetail(): BelongsTo
    {
        return $this->belongsTo(Rate::class, 'rate_id');
    }

    public function loggedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(ParkingTransaction::class, 'log_id');
    }
}