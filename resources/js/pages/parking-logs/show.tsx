import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, ReceiptIcon } from 'lucide-react';
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
            <span className="text-sm font-medium uppercase">{value}</span>
        </div>
    );
}

function ReceiptLine({ label, value, bold = false }: { label: string; value: React.ReactNode; bold?: boolean }) {
    return (
        <div className={`flex items-center justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
            <span>{label}</span>
            <span>{value}</span>
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

    let units: number;

    if (rateType === 'daily') {
        const days = Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
        units = days + 1;
    } else if (rateType === 'weekly') {
        const weeks = Math.round((startOfWeek(end).getTime() - startOfWeek(start).getTime()) / (7 * 86_400_000));
        units = weeks + 1;
    } else if (rateType === 'monthly') {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
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

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Button asChild variant="ghost" className="w-fit -ml-2">
                    <Link href={index()}>
                        <ArrowLeftIcon className="size-4" />
                        Back to Parking Logs
                    </Link>
                </Button>

                <div className="grid gap-2 lg:grid-cols-2 lg:items-start">
                    {/* LEFT: Ticket details */}
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
                            value={parkingLog.time_out ? end.toLocaleString() : isActive ? 'Still parked' : '—'}
                        />
                        <Row label="Duration" value={`${elapsedHours}h ${elapsedMinutes}m`} />
                        <Row label="Logged By" value={parkingLog.logged_by?.name ?? '—'} />

                        {isActive && !transaction && (
                            <div className="mt-4 flex justify-end">
                                <ParkingLogCheckoutDialog parkingLog={parkingLog} billing={billing} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Transaction Summary */}
                    <div className="mx-auto w-full max-w-lg rounded-lg border bg-white p-6 font-mono text-neutral-800 shadow-sm dark:bg-neutral-950 dark:text-neutral-200">
                        <p className="border-b border-dashed pb-2 text-center text-[10px] leading-tight text-muted-foreground uppercase">
                            This document is not an official receipt.
                            <br />
                            Not valid for claim of input tax.
                        </p>

                        <div className="flex flex-col items-center gap-1 border-b border-dashed py-4 text-center">
                            <ReceiptIcon className="size-5 text-muted-foreground" />
                            <p className="text-sm font-semibold tracking-wide uppercase">Transaction Summary</p>
                            <p className="text-xs text-muted-foreground">{parkingLog.uid}</p>
                        </div>

                        <div className="grid gap-1 border-b border-dashed py-4">
                            <ReceiptLine label="Plate No." value={parkingLog.plate_number} />
                            <ReceiptLine label="Vehicle Type" value={parkingLog.category?.name ?? '—'} />
                            <ReceiptLine label="Rate Type" value={billing.rateType} />
                        </div>

                        <div className="grid gap-1 border-b border-dashed py-4">
                            <ReceiptLine label="Time In" value={start.toLocaleString()} />
                            <ReceiptLine label="Time Out" value={parkingLog.time_out ? end.toLocaleString() : '—'} />
                        </div>

                        <div className="grid gap-1 border-b border-dashed py-4">
                            <ReceiptLine label={`Rate (per ${unitLabel})`} value={`₱${billing.unitPrice.toFixed(2)}`} />
                            <ReceiptLine label={`${unitLabel}(s) Charged`} value={`× ${billing.units}`} />
                            <ReceiptLine label="Total Amount Paid" value={`₱${billing.total.toFixed(2)}`} bold />
                        </div>

                        {transaction ? (
                            <div className="grid gap-1 border-b border-dashed py-4">
                                <ReceiptLine label="Amount Tendered" value={`₱${transaction.amount_paid}`} />
                                <ReceiptLine label="Change" value={`₱${transaction.change_due}`} />
                                <ReceiptLine
                                    label="Payment Method"
                                    value={<span className="capitalize">{transaction.payment_method}</span>}
                                />
                                <ReceiptLine label="Paid At" value={new Date(transaction.created_at ?? '').toLocaleString()} />
                            </div>
                        ) : (
                            <p className="border-b border-dashed py-4 text-center text-xs tracking-wide text-muted-foreground uppercase">
                                {isActive ? 'Awaiting Checkout' : 'No Payment Recorded'}
                            </p>
                        )}

                        <p className="pt-3 text-center text-[10px] leading-tight text-muted-foreground uppercase">
                            This document is not an official receipt.
                            <br />
                            Not valid for claim of input tax.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [{ title: 'Parking Logs', href: index() }],
};