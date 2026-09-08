import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { ParkingLog } from '@/types';

type Props = {
    newcomers: Pick<ParkingLog, 'id' | 'plate_number' | 'time_in'>[];
    latestCheckouts: Pick<ParkingLog, 'id' | 'plate_number' | 'time_out'>[];
};

export default function UserDashboard({ newcomers, latestCheckouts }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <h2 className="mb-4 font-semibold">Today's New Arrivals</h2>
                        <ul className="divide-y">
                            {newcomers.map((log) => (
                                <li key={log.id} className="flex justify-between py-2 text-sm">
                                    <span>{log.plate_number}</span>
                                    <span className="text-muted-foreground">
                                        {new Date(log.time_in).toLocaleTimeString()}
                                    </span>
                                </li>
                            ))}
                            {newcomers.length === 0 && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No vehicles logged in yet today.
                                </p>
                            )}
                        </ul>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <h2 className="mb-4 font-semibold">Latest Checkouts</h2>
                        <ul className="divide-y">
                            {latestCheckouts.map((log) => (
                                <li key={log.id} className="flex justify-between py-2 text-sm">
                                    <span>{log.plate_number}</span>
                                    <span className="text-muted-foreground">
                                        {log.time_out && new Date(log.time_out).toLocaleTimeString()}
                                    </span>
                                </li>
                            ))}
                            {latestCheckouts.length === 0 && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No checkouts yet today.
                                </p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

UserDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};