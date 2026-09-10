import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon } from 'lucide-react';
import { index } from '@/routes/parking-logs';
import { ParkingLogCheckoutDialog } from './partials/parking-log-checkout-dialog';
import type { ParkingLog } from '@/types/models';

type Props = {
    parkingLog: ParkingLog;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between border-b py-2 last:border-b-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

function calculateBilling(parkingLog: ParkingLog) {
    const start = new Date(parkingLog.time_in);
    const end = parkingLog.time_out ? new Date(parkingLog.time_out) : new Date();
    const unitPrice = Number(parkingLog.rate);
    const rateType = (parkingLog.rate_detail?.name ?? 'Hourly').toLowerCase();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const startOfWeek = (d: Date) => {
        const s = startOfDay(d);
        s.setDate(s.getDate() - s.getDay());
        return s;
    };
    const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

    let units: number;

    if (rateType === 'daily') {
        const days = Math.round(
            (startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000,
        );
        units = days + 1;
    } else if (rateType === 'weekly') {
        const weeks = Math.round(
            (startOfWeek(end).getTime() - startOfWeek(start).getTime()) / (7 * 86_400_000),
        );
        units = weeks + 1;
    } else if (rateType === 'monthly') {
        const months =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        units = months + 1;
    } else {
        const hours = Math.ceil((end.getTime() - start.getTime()) / 3_600_000);
        units = Math.max(1, hours);
    }

    return {
        rateType: parkingLog.rate_detail?.name ?? 'Hourly',
        unitPrice,
        units,
        total: Math.round(units * unitPrice * 100) / 100,
    };
}

export default function Show({ parkingLog }: Props) {
    const transaction = parkingLog.transaction;
    const isActive = parkingLog.status === 'Active';

    const start = new Date(parkingLog.time_in);
    const end = parkingLog.time_out ? new Date(parkingLog.time_out) : new Date();
    const elapsedMs = end.getTime() - start.getTime();
    const elapsedHours = Math.floor(elapsedMs / 3_600_000);
    const elapsedMinutes = Math.floor((elapsedMs % 3_600_000) / 60_000);

    const billing = calculateBilling(parkingLog);
    const unitLabel = billing.units === 1 ? billing.rateType.replace(/ly$/, '') : billing.rateType;

    return (
        <>
            <Head title={`Ticket — ${parkingLog.plate_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-xl">
                <Button asChild variant="ghost" className="w-fit -ml-2">
                    <Link href={index()}>
                        <ArrowLeftIcon className="size-4" />
                        Back to Parking Logs
                    </Link>
                </Button>

                <div className="rounded-xl border p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-lg font-semibold">{parkingLog.plate_number}</h1>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                            {parkingLog.status}
                        </Badge>
                    </div>

                    <Row label="Ticket ID" value={parkingLog.uid} />
                    <Row label="Category" value={parkingLog.category?.name ?? '—'} />
                    <Row label="Time In" value={start.toLocaleString()} />
                    <Row
                        label="Time Out"
                        value={
                            parkingLog.time_out
                                ? end.toLocaleString()
                                : isActive
                                    ? 'Still parked'
                                    : '—'
                        }
                    />
                    <Row label="Duration" value={`${elapsedHours}h ${elapsedMinutes}m`} />
                    <Row label="Logged By" value={parkingLog.logged_by?.name ?? '—'} />
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="mb-4 text-lg font-semibold">
                        Calculation{' '}
                        {isActive && (
                            <span className="text-sm font-normal text-muted-foreground">
                                (running)
                            </span>
                        )}
                    </h2>

                    <Row label="Rate Type" value={billing.rateType} />
                    <Row label="Rate" value={`₱${billing.unitPrice.toFixed(2)} / ${unitLabel}`} />
                    <Row label={`${billing.rateType} Units Charged`} value={billing.units} />
                    <Row
                        label="Formula"
                        value={`${billing.units} × ₱${billing.unitPrice.toFixed(2)}`}
                    />

                    <div className="flex items-center justify-between pt-3">
                        <span className="text-base font-semibold">Total Due</span>
                        <span className="text-base font-semibold">₱{billing.total.toFixed(2)}</span>
                    </div>

                    {isActive && (
                        <p className="pt-2 text-xs text-muted-foreground">
                            This updates the longer the vehicle stays. Recalculated at checkout.
                        </p>
                    )}
                </div>

                {isActive && !transaction && (
                    <div className="flex justify-end">
                        <ParkingLogCheckoutDialog
                            parkingLog={parkingLog}
                            billing={billing}
                        />
                    </div>
                )}

                {transaction && (
                    <div className="rounded-xl border p-4">
                        <h2 className="mb-4 text-lg font-semibold">Payment Details</h2>
                        <Row label="Amount Owed" value={`₱${billing.total.toFixed(2)}`} />
                        <Row label="Amount Paid" value={`₱${transaction.amount_paid}`} />
                        <Row label="Change Given" value={`₱${transaction.change_due}`} />
                        <Row
                            label="Payment Method"
                            value={
                                <span className="capitalize">
                                    {transaction.payment_method}
                                </span>
                            }
                        />
                        <Row
                            label="Paid At"
                            value={new Date(transaction.created_at ?? '').toLocaleString()}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [{ title: 'Parking Logs', href: index() }],
};