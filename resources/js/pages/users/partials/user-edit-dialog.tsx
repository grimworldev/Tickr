import { Form } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/routes/users';
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
import type { User } from '@/types';
import type { Branch } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

type Props = { user: User; branches: Branch[]; isAdmin: boolean };

export function UserEditDialog({ user, branches, isAdmin }: Props) {
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState(user.gender ?? '');
    const [role, setRole] = useState(String(user.role));
    const [branchIds, setBranchIds] = useState<number[]>(user.branches?.map((branch) => branch.id) ?? []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Edit user">
                    <PencilIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95dvh] overflow-y-auto min-w-3xl'>
                <Form
                    {...update.form(user.uuid)}
                    disableWhileProcessing
                    onSuccess={() => setOpen(false)}
                    className="grid gap-2 2"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update this user's account details.</DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" name="first_name" required autoFocus defaultValue={user.first_name} />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" name="last_name" required defaultValue={user.last_name} />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger id="gender" className='w-full'>
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
                                    <SelectTrigger id="role" className='w-full'>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isAdmin && <SelectItem value="0">Administrator</SelectItem>}
                                        <SelectItem value="1">User (Branch Manager)</SelectItem>
                                        <SelectItem value="2">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="role" value={role} />
                                <InputError message={errors.role} />
                            </div>

                            {role !== '0' && (
                                <div className="grid gap-2">
                                    <Label>Assigned Branches</Label>
                                    <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                                        {branches.map((branch) => (
                                            <label key={branch.id} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={branchIds.includes(branch.id)}
                                                    onCheckedChange={(checked) => setBranchIds((current) =>
                                                        checked
                                                            ? [...current, branch.id]
                                                            : current.filter((id) => id !== branch.id)
                                                    )}
                                                />
                                                {branch.name}
                                                {branchIds.includes(branch.id) && (
                                                    <input type="hidden" name="branch_ids[]" value={branch.id} />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.branch_ids} />
                                </div>
                            )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" required defaultValue={user.username} />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" required defaultValue={user.email} />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Password <span className="text-muted-foreground">(leave blank to keep current)</span>
                                </Label>
                                <Input id="password" type="password" name="password" />
                                <InputError message={errors.password} />
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