<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ParkingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plate_number' => ['nullable', 'string', 'max:20'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'rate_id' => ['nullable', 'exists:rates,id'],
            'time_out' => ['nullable', 'date'],
        ];
    }
}