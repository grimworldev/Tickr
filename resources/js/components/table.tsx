import { type ReactNode } from 'react';

export type Column<T> = {
    key: keyof T | string;
    header: string;
    render?: (row: T) => ReactNode;
    className?: string;
    /** Hide this column below the given breakpoint (e.g. 'md' hides on mobile, shows md and up) */
    hideBelow?: 'sm' | 'md' | 'lg';
};

type TableProps<T> = {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
    getRowKey?: (row: T, index: number) => string | number;
};

const hideBelowClasses: Record<NonNullable<Column<never>['hideBelow']>, string> = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
};

function getVisibilityClass<T>(column: Column<T>): string {
    return column.hideBelow ? hideBelowClasses[column.hideBelow] : '';
}

export function Table<T extends object>({
    data,
    columns,
    emptyMessage = 'No records found.',
    getRowKey,
}: TableProps<T>) {
    return (
        <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground border-border border-b">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className={`px-4 py-3 font-medium whitespace-nowrap ${getVisibilityClass(column)} ${column.className ?? ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-border divide-y">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-muted-foreground px-4 py-6 text-center"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr
                                key={getRowKey ? getRowKey(row, index) : index}
                                className="hover:bg-accent/50 transition-colors"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className={`px-4 py-3 ${getVisibilityClass(column)} ${column.className ?? ''}`}
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : String(row[column.key as keyof T] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}