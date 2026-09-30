import { Form } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/routes/rates';
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Rate } from '@/types';
import type { Category } from '@/types';

type Props = {
    rate: Rate;
    categories: Category[];
};

export function RateEditDialog({ rate, categories }: Props) {
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState(String(rate.category_id ?? ''));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Edit rate">
                    <PencilIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...update.form(rate.id)}
                    disableWhileProcessing
                    onSuccess={() => setOpen(false)}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Rate</DialogTitle>
                                <DialogDescription>
                                    Update this rate's name or price.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor={`category_id_${rate.id}`}>Vehicle Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger id={`category_id_${rate.id}`} className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="category_id" value={categoryId} />
                                <InputError message={errors.category_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    name="name"
                                    defaultValue={rate.name}
                                    placeholder="e.g. Hourly"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    required
                                    name="price"
                                    defaultValue={rate.price}
                                    placeholder="e.g. 150"
                                />
                                <InputError message={errors.price} />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}