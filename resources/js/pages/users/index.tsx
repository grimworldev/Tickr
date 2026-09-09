import { Table, type Column } from '@/components/table';
import { UserFormDialog } from './partials/user-form-dialog';
import { UserEditDialog } from './partials/user-edit-dialog';
import { UserDeleteDialog } from './partials/user-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { index } from '@/routes/users';
import { UserRole, userRoleLabel } from '@/types/auth';
import type { User } from '@/types';

type Props = {
    users: {
        data: User[];
    };
};

export default function Index({ users }: Props) {
    const columns: Column<User>[] = [
        { key: 'name', header: 'Name' },
        { key: 'username', header: 'Username', hideBelow: 'sm' },
        { key: 'email', header: 'Email', hideBelow: 'md' },
        {
            key: 'role',
            header: 'Role',
            render: (row) => (
                <Badge variant={row.role === UserRole.Administrator ? 'default' : 'secondary'}>
                    {userRoleLabel(row.role)}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <UserEditDialog user={row} />
                    <UserDeleteDialog user={row} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <UserFormDialog />
                </div>
                <Table data={users.data} columns={columns} getRowKey={(row) => row.id} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};