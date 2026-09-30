<?php

namespace App\Enums;

enum UserRole: int
{
    case Administrator = 0;
    case User = 1;
    case Staff = 2;

    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'System Administrator',
            self::User => 'Branch Manager',
            self::Staff => 'Staff',
        };
    }
}
