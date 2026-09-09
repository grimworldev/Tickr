import dayjs from 'dayjs';
import type { ParkingLog } from '@/types';

export type Billing = {
    rateType: string;
    unitPrice: number;
    units: number;
    total: number;
};

export function calculateBilling(parkingLog: ParkingLog): Billing {
    const start = dayjs(parkingLog.time_in);
    const end = parkingLog.time_out ? dayjs(parkingLog.time_out) : dayjs();
    const unitPrice = Number(parkingLog.rate);
    const rateType = (parkingLog.rate_detail?.name ?? 'Hourly').toLowerCase();

    let units: number;

    if (rateType === 'daily') {
        units = end.startOf('day').diff(start.startOf('day'), 'day') + 1;
    } else if (rateType === 'weekly') {
        units = end.startOf('week').diff(start.startOf('week'), 'week') + 1;
    } else if (rateType === 'monthly') {
        units = end.startOf('month').diff(start.startOf('month'), 'month') + 1;
    } else {
        units = Math.max(1, Math.ceil(end.diff(start, 'minute') / 60));
    }

    return {
        rateType: parkingLog.rate_detail?.name ?? 'Hourly',
        unitPrice,
        units,
        total: Math.round(units * unitPrice * 100) / 100,
    };
}