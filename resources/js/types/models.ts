export interface Rate {
    id: number;
    name: string;
    price: string; // decimal:2 cast serializes as string in JSON
    branch_id: number;
    category_id: number | null;
    category?: Category;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

export interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    rates?: Rate[];
}

export interface Branch {
    id: number;
    name: string;
    users_count?: number;
    parking_logs_count?: number;
}

export type ParkingStatus = 'Active' | 'Completed';

export type PaymentMethod = 'Cash' | 'GCash' | 'Maya' | 'Card';

export interface ParkingTransaction {
    id: number;
    uid: string;
    log_id: number;
    amount_paid: string; // decimal:2 cast serializes as string
    change_due: string; // decimal:2 cast serializes as string
    payment_method: PaymentMethod;
    processed_by: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ParkingLog {
    id: number;
    uid: string;
    plate_number: string;
    branch_id: number;
    category_id: number;
    rate_id: number;
    rate: string; // decimal:2 cast serializes as string
    time_in: string;
    time_out: string | null;
    status: ParkingStatus;
    logged_by:{
        id: number;
        name:string;
    }
    created_at: string | null;
    updated_at: string | null;
    category?: Category;
    rate_detail?: Rate;
    logged_by_user?: {
        id: number;
        name: string;
    };
    transaction?: ParkingTransaction;
}