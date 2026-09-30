import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/routes/rates';
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
import type { Category } from '@/types';

export function RateFormDialog({ categories }: { categories: Category[] }) {
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState('');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Rate</Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...store.form()}
                    resetOnSuccess
                    disableWhileProcessing
                    onSuccess={() => { setOpen(false); setCategoryId(''); }}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Add Rate</DialogTitle>
                                <DialogDescription>
                                    Create a new rate (e.g. Hourly, Daily, Whole Day).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Vehicle Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger id="category_id" className="w-full">
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
                                    placeholder="e.g. 150"
                                />
                                <InputError message={errors.price} />
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