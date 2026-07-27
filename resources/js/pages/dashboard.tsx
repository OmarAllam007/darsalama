import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    CalendarCheck2,
    CalendarDays,
    Sparkles,
    Stethoscope,
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ChartCard } from '@/components/charts/chart-card';
import { StatTile } from '@/components/charts/stat-tile';
import '@/lib/chartjs';
import { useThemeColors, withAlpha } from '@/lib/theme-colors';
import { dashboard } from '@/routes';

type Datum = { label: string; value: number };

type Stats = {
    total: number;
    today: number;
    thisWeek: number;
    activeDoctors: number;
};

const STATUS_COLOR_KEYS: Record<string, 'success' | 'warning' | 'destructive'> =
    {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'destructive',
    };

export default function Dashboard({
    stats,
    byDoctor,
    byDepartment,
    last7Days,
    next7Days,
    statusBreakdown,
    monthlyTrend,
}: {
    stats: Stats;
    byDoctor: Datum[];
    byDepartment: Datum[];
    last7Days: Datum[];
    next7Days: Datum[];
    statusBreakdown: Datum[];
    monthlyTrend: Datum[];
}) {
    const colors = useThemeColors();
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#192d68_0%,#101735_72%,#0b1028_100%)] px-6 py-7 text-white shadow-[0_24px_55px_-28px_rgba(11,16,40,0.8)] sm:px-8 sm:py-9">
                    <div className="pointer-events-none absolute -top-24 -right-14 size-72 rounded-full border border-[#d8ba66]/20" />
                    <div className="pointer-events-none absolute -right-16 -bottom-36 size-72 rounded-full bg-[#d8ba66]/10 blur-3xl" />
                    <Sparkles className="pointer-events-none absolute right-8 bottom-5 size-24 text-white/[0.035]" />
                    <div className="relative z-10">
                        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-[#d8ba66] uppercase">
                            <span className="size-1.5 rounded-full bg-[#d8ba66] shadow-[0_0_0_5px_rgba(216,186,102,0.12)]" />
                            Operations overview
                        </div>
                        <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                            Welcome back, {auth.user?.name?.split(' ')[0]}
                        </h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                            Here is a clear view of today’s patient activity and
                            hospital operations.
                        </p>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile
                        label="Total appointments"
                        value={stats.total}
                        icon={CalendarCheck2}
                    />
                    <StatTile
                        label="Today"
                        value={stats.today}
                        icon={Activity}
                        tone="emerald"
                    />
                    <StatTile
                        label="This week"
                        value={stats.thisWeek}
                        icon={CalendarDays}
                        tone="gold"
                    />
                    <StatTile
                        label="Active doctors"
                        value={stats.activeDoctors}
                        icon={Stethoscope}
                        tone="rose"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartCard title="Appointments by doctor">
                        <Bar
                            data={{
                                labels: byDoctor.map((d) => d.label),
                                datasets: [
                                    {
                                        data: byDoctor.map((d) => d.value),
                                        backgroundColor: colors['chart-1'],
                                        borderRadius: 4,
                                        maxBarThickness: 24,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                indexAxis: 'y',
                                scales: {
                                    x: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 },
                                        grid: { color: colors.border },
                                    },
                                    y: { grid: { display: false } },
                                },
                            }}
                        />
                    </ChartCard>

                    <ChartCard title="Appointments by department">
                        <Doughnut
                            data={{
                                labels: byDepartment.map((d) => d.label),
                                datasets: [
                                    {
                                        data: byDepartment.map((d) => d.value),
                                        backgroundColor: [
                                            colors['chart-1'],
                                            colors['chart-2'],
                                            colors['chart-3'],
                                            colors['chart-4'],
                                            colors['chart-5'],
                                        ],
                                        borderColor: 'transparent',
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { boxWidth: 10, padding: 12 },
                                    },
                                },
                            }}
                        />
                    </ChartCard>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartCard title="Appointment status">
                        <Doughnut
                            data={{
                                labels: statusBreakdown.map((d) => d.label),
                                datasets: [
                                    {
                                        data: statusBreakdown.map(
                                            (d) => d.value,
                                        ),
                                        backgroundColor: statusBreakdown.map(
                                            (d) =>
                                                colors[
                                                    STATUS_COLOR_KEYS[
                                                        d.label
                                                    ] ?? 'chart-1'
                                                ] ?? colors['chart-1'],
                                        ),
                                        borderColor: 'transparent',
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { boxWidth: 10, padding: 12 },
                                    },
                                },
                            }}
                        />
                    </ChartCard>

                    <ChartCard title="Appointments over the last 6 months">
                        <Line
                            data={{
                                labels: monthlyTrend.map((d) => d.label),
                                datasets: [
                                    {
                                        data: monthlyTrend.map((d) => d.value),
                                        borderColor: colors['chart-2'],
                                        backgroundColor: withAlpha(
                                            colors['chart-2'],
                                            0.1,
                                        ),
                                        pointBackgroundColor: colors['chart-2'],
                                        pointBorderColor: colors['chart-2'],
                                        pointRadius: 4,
                                        borderWidth: 2,
                                        tension: 0.3,
                                        fill: true,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 },
                                        grid: { color: colors.border },
                                    },
                                    x: { grid: { display: false } },
                                },
                            }}
                        />
                    </ChartCard>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartCard title="Last 7 days">
                        <Bar
                            data={{
                                labels: last7Days.map((d) => d.label),
                                datasets: [
                                    {
                                        data: last7Days.map((d) => d.value),
                                        backgroundColor: colors['chart-3'],
                                        borderRadius: 4,
                                        maxBarThickness: 24,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 },
                                        grid: { color: colors.border },
                                    },
                                    x: { grid: { display: false } },
                                },
                            }}
                        />
                    </ChartCard>

                    <ChartCard title="Next 7 days">
                        <Bar
                            data={{
                                labels: next7Days.map((d) => d.label),
                                datasets: [
                                    {
                                        data: next7Days.map((d) => d.value),
                                        backgroundColor: colors['chart-4'],
                                        borderRadius: 4,
                                        maxBarThickness: 24,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 },
                                        grid: { color: colors.border },
                                    },
                                    x: { grid: { display: false } },
                                },
                            }}
                        />
                    </ChartCard>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
