import { Form } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/routes/parking-logs';
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
import type { ParkingLog } from '@/types/models';

type Props = {
    parkingLog: ParkingLog;
};

export function ParkingLogCheckoutDialog({ parkingLog }: Props) {
    const [open, setOpen] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const rateOwed = Number(parkingLog.rate);
    const paid = Number(amountPaid) || 0;
    const change = paid > rateOwed ? paid - rateOwed : 0;

    const resetFields = () => {
        setAmountPaid('');
        setPaymentMethod('cash');
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
                <Button variant="ghost" size="icon" aria-label="Checkout vehicle">
                    <LogOutIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...update.form(parkingLog.id)}
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
                                    <strong>{parkingLog.plate_number}</strong>. Amount owed:{' '}
                                    <strong>₱{rateOwed.toFixed(2)}</strong>.
                                </DialogDescription>
                            </DialogHeader>

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
                                <InputError message={errors.amount_paid} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger id="payment_method">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="maya">Maya</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="payment_method"
                                    value={paymentMethod}
                                />
                                <InputError message={errors.payment_method} />
                            </div>

                            {paid > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Change: <strong>₱{change.toFixed(2)}</strong>
                                </p>
                            )}

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