import { Form } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { destroy } from '@/routes/parking-logs';
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
import { Spinner } from '@/components/ui/spinner';
import type { ParkingLog } from '@/types/models';

type Props = {
    parkingLog: ParkingLog;
};

export function ParkingLogDeleteDialog({ parkingLog }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete parking log"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2Icon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...destroy.form(parkingLog.uid)}
                    disableWhileProcessing
                    onSuccess={() => setOpen(false)}
                    className="grid gap-6"
                >
                    {({ processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Delete Parking Log</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the log for{' '}
                                    <strong>{parkingLog.plate_number}</strong>? This action
                                    cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Delete
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}