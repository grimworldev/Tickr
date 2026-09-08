<?php

namespace App\Enums;

enum ParkingStatus: string
{
    case Active = 'Active';
    case Completed = 'Completed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Completed => 'Completed',
        };
    }
}