<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParkingLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'plate_number' => $this->plate_number,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'rate_detail' => $this->whenLoaded('rateDetail', function () {
                return [
                    'id' => $this->rateDetail->id,
                    'name' => $this->rateDetail->name,
                ];
            }),
            'rate' => (float) $this->rate,
            'time_in' => $this->time_in ? $this->time_in->toIso8601String() : null,
            'time_out' => $this->time_out ? $this->time_out->toIso8601String() : null,
            'status' => $this->status,
            'logged_by' => $this->whenLoaded('loggedBy', function () {
                return [
                    'id' => $this->loggedBy->id,
                    'name' => trim("{$this->loggedBy->first_name} {$this->loggedBy->last_name}"),
                ];
            }),
            'transaction' => $this->whenLoaded('transaction'),
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}