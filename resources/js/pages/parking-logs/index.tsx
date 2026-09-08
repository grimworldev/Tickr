import { Table, type Column } from '@/components/table';
import { ParkingLogFormDialog } from './partials/parking-log-form-dialog';
import { ParkingLogCheckoutDialog } from './partials/parking-log-checkout-dialog';
import { ParkingLogDeleteDialog } from './partials/parking-log-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { index, show } from '@/routes/parking-logs';
import type { ParkingLog, Category, Rate } from '@/types';

type Props = {
    parkingLogs: {
        data: ParkingLog[];
    };
    categories: Category[];
    rates: Rate[];
};

export default function Index({ parkingLogs, categories, rates }: Props) {
    console.log(parkingLogs)
    const columns: Column<ParkingLog>[] = [
        { key: 'id', header: 'ID', hideBelow: 'sm' },
        { key: 'plate_number', header: 'Plate Number' },
        {
            key: 'category',
            header: 'Category',
            render: (row) => row.category?.name ?? '—',
        },
        {
            key: 'rate',
            header: 'Rate',
            hideBelow: 'md',
            render: (row) => `₱${row.rate}`,
        },
        {
            key: 'time_in',
            header: 'Time In',
            render: (row) => new Date(row.time_in).toLocaleString(),
        },
        {
            key: 'time_out',
            header: 'Time Out',
            hideBelow: 'md',
            render: (row) =>
                row.time_out ? new Date(row.time_out).toLocaleString() : '—',
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
                    {row.status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="View parking log">
                        <Link href={show(row.uid).url}>
                            <EyeIcon className="size-4" />
                        </Link>
                    </Button>
                    {row.status === 'Active' && (
                        <ParkingLogCheckoutDialog parkingLog={row} />
                    )}
                    <ParkingLogDeleteDialog parkingLog={row} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Parking Logs" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <ParkingLogFormDialog categories={categories} rates={rates} />
                </div>
                <Table data={parkingLogs.data} columns={columns} getRowKey={(row) => row.id} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Parking Logs',
            href: index(),
        },
    ],
};