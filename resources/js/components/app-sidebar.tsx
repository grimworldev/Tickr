import { Link } from '@inertiajs/react';
import { BookOpen, CarFront, FolderGit2, LayoutGrid, Store, Tags, Ticket, Users } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { UserRole } from '@/types/auth';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Tags,
    },
    {
        title: 'Rates',
        href: '/rates',
        icon: Ticket,
    },
    {
        title: 'Parking Logs',
        href: '/parking-logs',
        icon: CarFront,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Branches',
        href: '/branches',
        icon: Store,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: { role: number } } }>().props;
    const mainItems = mainNavItems.filter((item) => {
        if (item.title === 'Branches') return auth.user.role === UserRole.Administrator;
        if (item.title === 'Categories' || item.title === 'Rates' || item.title === 'Users') {
            return auth.user.role !== UserRole.Staff;
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}