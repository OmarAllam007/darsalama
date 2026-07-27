import { Link } from '@inertiajs/react';
import {
    CalendarClock,
    CalendarRange,
    ExternalLink,
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
import { dashboard, home } from '@/routes';
import { index as appointments } from '@/routes/admin/appointments';
import { index as callbackRequests } from '@/routes/admin/callback-requests';
import { index as departments } from '@/routes/admin/departments';
import { index as doctorSchedules } from '@/routes/admin/doctor-schedules';
import { index as doctors } from '@/routes/admin/doctors';
import { index as feedback } from '@/routes/admin/feedback';
import { index as nationalities } from '@/routes/admin/nationalities';
import { index as offers } from '@/routes/admin/offers';
import { index as packages } from '@/routes/admin/packages';
import type { NavItem } from '@/types';

const careNavItems: NavItem[] = [
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
        title: 'Doctor Schedules',
        href: doctorSchedules(),
        icon: CalendarRange,
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
];

const directoryNavItems: NavItem[] = [
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
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-none [&_[data-sidebar=sidebar]]:bg-[linear-gradient(180deg,#17295f_0%,#101735_58%,#0b1028_100%)] [&_[data-sidebar=sidebar]]:shadow-[0_24px_70px_-24px_rgba(9,15,42,0.85)]"
        >
            <SidebarHeader className="border-b border-white/8 px-2 pt-2 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 rounded-xl hover:bg-white/8 data-[state=open]:bg-white/8"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-3">
                <NavMain items={careNavItems} label="Care operations" />
                <NavMain items={directoryNavItems} label="Hospital directory" />
            </SidebarContent>

            <SidebarFooter className="gap-2 border-t border-white/8 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="h-10 rounded-xl border border-white/8 bg-white/5 px-3 text-white/60 hover:bg-white/10 hover:text-white"
                            tooltip={{ children: 'View public website' }}
                        >
                            <Link href={home()} target="_blank">
                                <ExternalLink />
                                <span>Public website</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
