import { Head } from '@inertiajs/react';
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

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatTile label="Total appointments" value={stats.total} />
                    <StatTile label="Today" value={stats.today} />
                    <StatTile label="This week" value={stats.thisWeek} />
                    <StatTile
                        label="Active doctors"
                        value={stats.activeDoctors}
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
