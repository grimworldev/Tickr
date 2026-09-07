import { Table, type Column } from '@/components/table';
import { CategoryFormDialog } from './partials/category-form-dialog';
import { CategoryEditDialog } from './partials/category-edit-dialog';
import { CategoryDeleteDialog } from './partials/category-delete-dialog';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/categories';
import type { Category } from '@/types';

type Props = {
    categories: {
        data: Category[];
    };
};

export default function Index({ categories }: Props) {
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

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <CategoryFormDialog />
                </div>
                <Table data={categories.data} columns={columns} getRowKey={(row) => row.id} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(),
        },
    ],
};