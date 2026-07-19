import { Link } from '@inertiajs/react';
import {
    CalendarClock,
    Flag,
    LayoutGrid,
    MessageSquareHeart,
    Package as PackageIcon,
    Percent,
    PhoneCall,
    Stethoscope,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
import { index as appointments } from '@/routes/admin/appointments';
import { index as callbackRequests } from '@/routes/admin/callback-requests';
import { index as departments } from '@/routes/admin/departments';
import { index as doctors } from '@/routes/admin/doctors';
import { index as feedback } from '@/routes/admin/feedback';
import { index as nationalities } from '@/routes/admin/nationalities';
import { index as offers } from '@/routes/admin/offers';
import { index as packages } from '@/routes/admin/packages';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Appointments',
        href: appointments(),
        icon: CalendarClock,
    },
    {
        title: 'Callback Requests',
        href: callbackRequests(),
        icon: PhoneCall,
    },
    {
        title: 'Feedback',
        href: feedback(),
        icon: MessageSquareHeart,
    },
    {
        title: 'Doctors',
        href: doctors(),
        icon: Stethoscope,
    },
    {
        title: 'Departments',
        href: departments(),
        icon: Tags,
    },
    {
        title: 'Nationalities',
        href: nationalities(),
        icon: Flag,
    },
    {
        title: 'Packages',
        href: packages(),
        icon: PackageIcon,
    },
    {
        title: 'Offers',
        href: offers(),
        icon: Percent,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
