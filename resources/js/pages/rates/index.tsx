import { Table, type Column } from '@/components/table';
import { RateFormDialog } from './partials/rate-form-dialog';
import { RateEditDialog } from './partials/rate-edit-dialog';
import { RateDeleteDialog } from './partials/rate-delete-dialog';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/rates';
import type { Rate } from '@/types';

type Props = {
    rates: {
        data: Rate[];
    };
};

export default function Index({ rates }: Props) {
    const columns: Column<Rate>[] = [
        { key: 'id', header: 'ID', hideBelow: 'sm' },
        { key: 'name', header: 'Name' },
        { key: 'price', header: 'Price' },
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
                    <RateEditDialog rate={row} />
                    <RateDeleteDialog rate={row} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Rates" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <RateFormDialog />
                </div>
                <Table data={rates.data} columns={columns} getRowKey={(row) => row.id} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Rates',
            href: index(),
        },
    ],
};