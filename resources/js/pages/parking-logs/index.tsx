import { CardGrid } from '@/components/card-grid';
import { Pagination } from '@/components/pagination';
import { PerPageSelect } from '@/components/per-page-select';
import { ParkingLogCard } from './components/parking-log-card';
import { ParkingLogFormDialog } from './partials/parking-log-form-dialog';
import { ParkingLogFilters } from './components/filter';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/parking-logs';
import type { ParkingLog, Category, Rate, PaginatedResponse } from '@/types';

type Filters = {
    category_id?: string;
    rate_id?: string;
    status?: string;
    date?: string;
    per_page?: string;
};

type Props = {
    parkingLogs: PaginatedResponse<ParkingLog>;
    categories: Category[];
    rates: Rate[];
    filters: Filters;
};

export default function Index({ parkingLogs, categories, rates, filters }: Props) {
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

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <PerPageSelect
                        url={index().url}
                        value={Number(filters.per_page ?? 25)}
                        params={filters}
                    />
                    <Pagination links={parkingLogs.links} />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Parking Logs', href: index() }],
};