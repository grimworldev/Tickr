<?php

namespace App\Enums;

enum UserRole: int
{
    case Administrator = 0;
    case User = 1;

    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'System Administrator',
            self::User => 'User',
        };
    }
}