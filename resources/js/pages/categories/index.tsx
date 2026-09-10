import { Table, type Column } from '@/components/table';
import { Pagination } from '@/components/pagination';
import { PerPageSelect } from '@/components/per-page-select';
import { CategoryFormDialog } from './partials/category-form-dialog';
import { CategoryEditDialog } from './partials/category-edit-dialog';
import { CategoryDeleteDialog } from './partials/category-delete-dialog';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/categories';
import type { Category, PaginatedResponse } from '@/types';

type Props = {
    categories: PaginatedResponse<Category>;
    filters: { per_page?: string };
};

export default function Index({ categories, filters }: Props) {
    const columns: Column<Category>[] = [
        { key: 'id', header: 'ID', hideBelow: 'sm' },
        { key: 'name', header: 'Name' },
        {
            key: 'created_at',
            header: 'Created At',
            hideBelow: 'md',
            render: (row) =>
                row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <CategoryEditDialog category={row} />
                    <CategoryDeleteDialog category={row} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <CategoryFormDialog />
                </div>

                <Table data={categories.data} columns={columns} getRowKey={(row) => row.id} />

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <PerPageSelect url={index().url} value={Number(filters.per_page ?? 25)} params={filters} />
                    <Pagination links={categories.links} />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Categories', href: index() }],
};