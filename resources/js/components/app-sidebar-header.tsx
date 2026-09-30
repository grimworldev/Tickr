import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { router, usePage } from '@inertiajs/react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem as BreadcrumbItemType, Branch } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { branches, activeBranchId } = usePage<{
        branches: Branch[];
        activeBranchId: number | null;
    }>().props;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {branches?.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                    <span className="hidden text-sm text-muted-foreground sm:inline">Branch</span>
                    <Select
                        value={String(activeBranchId ?? '')}
                        onValueChange={(value) => router.post('/active-branch', { branch_id: Number(value) }, {
                            preserveScroll: true,
                        })}
                    >
                        <SelectTrigger className="w-44" aria-label="Select active branch">
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={String(branch.id)}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </header>
    );
}
