import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Table, type Column } from '@/components/table';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Branch } from '@/types';

type Props = { branches: Branch[] };

export default function Index({ branches }: Props) {
    const [name, setName] = useState('');
    const columns: Column<Branch>[] = [
        { key: 'name', header: 'Branch' },
        { key: 'users_count', header: 'Assigned Users' },
        { key: 'parking_logs_count', header: 'Vehicles Logged' },
    ];

    return (
        <>
            <Head title="Branches" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border p-4">
                    <h2 className="mb-4 font-semibold">Add Branch</h2>
                    <Form
                        action="/branches"
                        method="post"
                        resetOnSuccess
                        onSuccess={() => setName('')}
                        className="flex flex-wrap items-end gap-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid min-w-60 flex-1 gap-2">
                                    <Label htmlFor="branch_name">Branch Name</Label>
                                    <Input
                                        id="branch_name"
                                        name="name"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="e.g. Downtown Branch"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Add Branch
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <Table data={branches} columns={columns} getRowKey={(branch) => branch.id} />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Branches', href: '/branches' }],
};
