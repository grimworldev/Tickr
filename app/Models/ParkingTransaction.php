<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['log_id', 'amount_paid', 'change_due', 'payment_method', 'processed_by'])]
class ParkingTransaction extends Model
{
    use HasFactory, HasUuids;

    public function uniqueIds(): array
    {
        return ['uid'];
    }

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'change_due' => 'decimal:2',
            'payment_method' => PaymentMethod::class,
        ];
    }

    public function parkingLog(): BelongsTo
    {
        return $this->belongsTo(ParkingLog::class, 'log_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
