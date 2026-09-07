export interface Rate {
    id: number;
    name: string;
    price: string; // decimal:2 cast serializes as string in JSON
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
}