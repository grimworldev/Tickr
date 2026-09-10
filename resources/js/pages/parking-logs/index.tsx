import { CardGrid } from '@/components/card-grid';
import { ParkingLogCard } from './components/parking-log-card';
import { ParkingLogFormDialog } from './partials/parking-log-form-dialog';
import { ParkingLogFilters } from './components/filter';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/parking-logs';
import type { ParkingLog, Category, Rate } from '@/types';

type Props = {
    parkingLogs: {
        data: ParkingLog[];
    };
    categories: Category[];
    rates: Rate[];
    filters: {
        category_id?: string;
        rate_id?: string;
        status?: string;
        date?: string;
    };
};

export default function Index({ parkingLogs, categories, rates, filters }: Props) {
    console.log(parkingLogs)
    return (
        <>
            <Head title="Parking Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <ParkingLogFilters categories={categories} rates={rates} filters={filters} />
                    <ParkingLogFormDialog categories={categories} rates={rates} />
                </div>

                <CardGrid
                    data={parkingLogs.data}
                    getKey={(row) => row.id}
                    renderItem={(row) => <ParkingLogCard parkingLog={row} />}
                />
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