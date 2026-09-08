<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'Cash';
    case GCash = 'GCash';
    case Maya = 'Maya';
    case Card = 'Card';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::GCash => 'GCash',
            self::Maya => 'Maya',
            self::Card => 'Card',
        };
    }
}