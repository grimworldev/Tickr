import { type ReactNode } from 'react';

type CardGridProps<T> = {
    data: T[];
    renderItem: (item: T, index: number) => ReactNode;
    getKey?: (item: T, index: number) => string | number;
    emptyMessage?: string;
};

export function CardGrid<T>({
    data,
    renderItem,
    getKey,
    emptyMessage = 'No records found.',
}: CardGridProps<T>) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>{renderItem(item, index)}</div>
            ))}
        </div>
    );
}