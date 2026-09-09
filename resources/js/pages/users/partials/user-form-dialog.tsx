import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/routes/users';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export function UserFormDialog() {
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState('');
    const [role, setRole] = useState('1');

    const resetFields = () => {
        setGender('');
        setRole('1');
    };

    return (
        <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetFields(); }}>
            <DialogTrigger asChild>
                <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95dvh] overflow-y-auto">
                <Form
                    {...store.form()}
                    resetOnSuccess
                    disableWhileProcessing
                    onSuccess={() => { setOpen(false); resetFields(); }}
                    className="grid gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Add User</DialogTitle>
                                <DialogDescription>Create a new staff or admin account.</DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" name="first_name" required autoFocus />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" name="last_name" required />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger id="gender" className="w-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="gender" value={gender} />
                                <InputError message={errors.gender} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="role">Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role" className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Administrator</SelectItem>
                                        <SelectItem value="1">User</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="role" value={role} />
                                <InputError message={errors.role} />
                            </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" required />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" required />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" name="password" required />
                                <InputError message={errors.password} />
                            </div>

                            

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Create User
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}