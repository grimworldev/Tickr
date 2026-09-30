export const UserRole = {
    Administrator: 0,
    User: 1,
    Staff: 2,
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

export function userRoleLabel(role: UserRoleValue): string {
    return {
        [UserRole.Administrator]: 'System Administrator',
        [UserRole.User]: 'User (Branch Manager)',
        [UserRole.Staff]: 'Staff',
    }[role];
}

export type User = {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    name: string;
    gender: 'Male' | 'Female' | 'Other' | null;
    username: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: UserRoleValue;
    branches?: { id: number; name: string }[];
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};