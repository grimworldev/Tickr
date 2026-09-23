import { router } from '@inertiajs/react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Props = {
    url: string;
    value: number;
    options?: number[];
    params?: Record<string, string | undefined>;
};

export function PerPageSelect({ url, value, options = [25, 50, 75, 100], params = {} }: Props) {
    const handleChange = (newValue: string) => {
        router.get(
            url,
            { ...params, per_page: newValue, page: 1 }, // reset to page 1 on size change
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <Select value={String(value)} onValueChange={handleChange}>
            <SelectTrigger className="w-[110px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                        {n} / page
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}