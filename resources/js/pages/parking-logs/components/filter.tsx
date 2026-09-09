import { router } from '@inertiajs/react';
import { index } from '@/routes/parking-logs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import type { Category, Rate } from '@/types';

type Filters = {
    category_id?: string;
    rate_id?: string;
    status?: string;
    date?: string;
};

type Props = {
    categories: Category[];
    rates: Rate[];
    filters: Filters;
};

const ALL = '__all__';

export function ParkingLogFilters({ categories, rates, filters }: Props) {
    const applyFilter = (key: keyof Filters, value: string) => {
        router.get(
            index().url,
            { ...filters, [key]: value === ALL ? undefined : value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilters = () => {
        router.get(index().url, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.category_id ?? ALL} onValueChange={(v) => applyFilter('category_id', v)}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Categories</SelectItem>
                    {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.rate_id ?? ALL} onValueChange={(v) => applyFilter('rate_id', v)}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Rate Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Rate Types</SelectItem>
                    {rates.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.status ?? ALL} onValueChange={(v) => applyFilter('status', v)}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
            </Select>

            <Input
                type="date"
                value={filters.date ?? ''}
                onChange={(e) => applyFilter('date', e.target.value)}
                className="w-[160px]"
            />

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <XIcon className="size-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}