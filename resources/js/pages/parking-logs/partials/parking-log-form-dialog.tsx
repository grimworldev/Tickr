import { Form } from '@inertiajs/react';
import { useState } from 'react';
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

type Props = {
    categories: Category[];
    rates: Rate[];
};

export function ParkingLogFormDialog({ categories, rates }: Props) {
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [rateId, setRateId] = useState('');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Log New Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
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

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger id="category_id">
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
                                    <SelectTrigger id="rate_id">
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