import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { show } from '@/routes/parking-logs';
import { ParkingLogDeleteDialog } from '../partials/parking-log-delete-dialog';
import { ParkingLogCheckoutDialog } from '../partials/parking-log-checkout-dialog';
import { calculateBilling } from '@/lib/parking-billing';
import type { ParkingLog } from '@/types';

type Props = {
    parkingLog: ParkingLog;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function TimeBlock({
    label,
    value,
    align = 'left',
}: {
    label: string;
    value: dayjs.Dayjs | null;
    align?: 'left' | 'right';
}) {
    return (
        <div className={align === 'right' ? 'text-right' : 'text-left'}>
            <p className="text-xs text-muted-foreground">{label}</p>
            {value ? (
                <>
                    <p className="text-sm font-medium">{value.format('h:mm A')}</p>
                    <p className="text-xs text-muted-foreground">{value.format('MMM D, YYYY')}</p>
                </>
            ) : (
                <p className="font-medium">—</p>
            )}
        </div>
    );
}

export function ParkingLogCard({ parkingLog }: Props) {
    const isActive = parkingLog.status === 'Active';
    const hasTransaction = Boolean(parkingLog.transaction);

    const start = dayjs(parkingLog.time_in);
    const end = parkingLog.time_out ? dayjs(parkingLog.time_out) : dayjs();
    const elapsedMinutesTotal = end.diff(start, 'minute');
    const elapsedHours = Math.floor(elapsedMinutesTotal / 60);
    const elapsedMinutes = elapsedMinutesTotal % 60;

    const billing = calculateBilling(parkingLog);

    return (
        <div className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{parkingLog.plate_number}</h3>
                <Badge variant={isActive ? 'default' : 'secondary'}>{parkingLog.status}</Badge>
            </div>

            <div className="grid gap-1.5">
                <Row label="Ticket No." value={parkingLog.uid.slice().toUpperCase()} />
                <Row label="Type of Vehicle" value={parkingLog.category?.name ?? '—'} />
                <Row label="Logged By" value={parkingLog.logged_by?.name ?? '—'} />
            </div>

            <div className="border-t pt-3">
                <div className="flex items-start justify-between">
                    <TimeBlock label="Time In" value={start} />
                    <TimeBlock
                        label="Time Out"
                        value={parkingLog.time_out ? end : null}
                        align="right"
                    />
                </div>

                <div className="mt-3 grid gap-1.5">
                    <Row label="Duration" value={`${elapsedHours}h ${elapsedMinutes}m`} />
                    <Row label="Rate Type" value={parkingLog.rate_detail?.name ?? '—'} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
                <div>
                    {isActive && !hasTransaction && (
                        <ParkingLogCheckoutDialog parkingLog={parkingLog} billing={billing} />
                    )}
                </div>

                <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="View parking log">
                        <Link href={show(parkingLog.uid).url}>
                            <EyeIcon className="size-4" />
                        </Link>
                    </Button>
                    <ParkingLogDeleteDialog parkingLog={parkingLog} />
                </div>
            </div>
        </div>
    );
}