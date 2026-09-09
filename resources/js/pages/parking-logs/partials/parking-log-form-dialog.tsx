import { Form, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { store } from '@/routes/parking-logs';
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
import type { Category, Rate } from '@/types';
import type { Auth } from '@/types';

type Props = {
    categories: Category[];
    rates: Rate[];
};

export function ParkingLogFormDialog({ categories, rates }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [rateId, setRateId] = useState('');
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        if (!open) return;

        const interval = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(interval);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Log New Vehicle</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95dvh] overflow-y-auto">
                <Form
                    {...store.form()}
                    resetOnSuccess
                    disableWhileProcessing
                    onSuccess={() => {
                        setOpen(false);
                        setCategoryId('');
                        setRateId('');
                    }}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Log New Vehicle</DialogTitle>
                                <DialogDescription>
                                    Record a vehicle entering the parking lot.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="plate_number">Plate Number</Label>
                                <Input
                                    id="plate_number"
                                    type="text"
                                    required
                                    autoFocus
                                    name="plate_number"
                                    placeholder="e.g. ABC-1234"
                                />
                                <InputError message={errors.plate_number} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger id="category_id" className="w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="category_id" value={categoryId} />
                                    <InputError message={errors.category_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rate_id">Rate</Label>
                                    <Select value={rateId} onValueChange={setRateId}>
                                        <SelectTrigger id="rate_id" className="w-full">
                                            <SelectValue placeholder="Select a rate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rates.map((rate) => (
                                                <SelectItem key={rate.id} value={String(rate.id)}>
                                                    {rate.name} (₱{rate.price})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" name="rate_id" value={rateId} />
                                    <InputError message={errors.rate_id} />
                                </div>
                            </div>

                            <div className="grid gap-1.5 rounded-lg border bg-muted/40 p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Time In</span>
                                    <span className="font-medium">{now.format('h:mm:ss A')}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">{now.format('MMM D, YYYY')}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Logged By</span>
                                    <span className="font-medium">{auth.user.name}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}