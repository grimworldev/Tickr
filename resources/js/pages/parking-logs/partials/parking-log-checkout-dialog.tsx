import { Form } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { checkout } from '@/routes/parking-logs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Billing } from '@/lib/parking-billing';
import type { ParkingLog } from '@/types';

type Props = {
    parkingLog: ParkingLog;
    billing: Billing;
};

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export function ParkingLogCheckoutDialog({ parkingLog, billing }: Props) {
    const [open, setOpen] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const paid = Number(amountPaid) || 0;
    const change = paid > billing.total ? paid - billing.total : 0;

    const resetFields = () => {
        setAmountPaid('');
        setPaymentMethod('Cash');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);
                if (!value) resetFields();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    Checkout
                    <LogOutIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...checkout.form(parkingLog.uid)}
                    disableWhileProcessing
                    onSuccess={() => {
                        setOpen(false);
                        resetFields();
                    }}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Checkout Vehicle</DialogTitle>
                                <DialogDescription>
                                    Confirm checkout and payment for{' '}
                                    <strong>{parkingLog.plate_number}</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-1.5 rounded-lg border bg-muted/40 p-3">
                                <SummaryRow label="Rate Type" value={billing.rateType} />
                                <SummaryRow
                                    label="Rate"
                                    value={`₱${billing.unitPrice.toFixed(2)} / ${billing.rateType}`}
                                />
                                <SummaryRow label="Duration" value={billing.units} />
                                <SummaryRow
                                    label="Formula"
                                    value={`${billing.units} × ₱${billing.unitPrice.toFixed(2)}`}
                                />
                                <div className="mt-1 flex items-center justify-between border-t pt-1.5">
                                    <span className="text-sm font-semibold">Total Due</span>
                                    <span className="text-sm font-semibold">₱{billing.total.toFixed(2)}</span>
                                </div>
                                {paid > 0 && (
                                    <SummaryRow label="Change" value={`₱${change.toFixed(2)}`} />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount_paid">Amount Paid</Label>
                                    <Input
                                        id="amount_paid"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        required
                                        autoFocus
                                        name="amount_paid"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger id="payment_method" className='w-full'>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="GCash">GCash</SelectItem>
                                            <SelectItem value="Maya">Maya</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="payment_method" value={paymentMethod} />
                                    <InputError message={errors.payment_method} />
                                </div>
                                <InputError className='col-span-2' message={errors.amount_paid} />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Checkout
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}