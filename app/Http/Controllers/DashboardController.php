<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with appointment stats and charts.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'total' => Appointment::count(),
                'today' => Appointment::whereDate('date', today())->count(),
                'thisWeek' => Appointment::whereBetween('date', [
                    today()->startOfWeek()->toDateString(),
                    today()->endOfWeek()->toDateString(),
                ])->count(),
                'activeDoctors' => Doctor::where('is_active', true)->count(),
            ],
            'byDoctor' => DB::table('appointments')
                ->join('doctors', 'doctors.id', '=', 'appointments.doctor_id')
                ->selectRaw('doctors.name as label, count(*) as value')
                ->groupBy('doctors.id', 'doctors.name')
                ->orderByDesc('value')
                ->limit(8)
                ->get(),
            'byDepartment' => DB::table('appointments')
                ->join('doctors', 'doctors.id', '=', 'appointments.doctor_id')
                ->join('departments', 'departments.id', '=', 'doctors.department_id')
                ->selectRaw('departments.name as label, count(*) as value')
                ->groupBy('departments.id', 'departments.name')
                ->orderByDesc('value')
                ->get(),
            'last7Days' => $this->dailyCounts(-6, 0),
            'next7Days' => $this->dailyCounts(0, 6),
            'statusBreakdown' => DB::table('appointments')
                ->selectRaw('status as label, count(*) as value')
                ->groupBy('status')
                ->orderByDesc('value')
                ->get(),
            'monthlyTrend' => $this->monthlyTrend(),
        ]);
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function dailyCounts(int $startOffset, int $endOffset): array
    {
        $start = today()->addDays($startOffset);
        $end = today()->addDays($endOffset);

        $counts = DB::table('appointments')
            ->selectRaw('date, count(*) as value')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->groupBy('date')
            ->pluck('value', 'date');

        return collect(range($startOffset, $endOffset))
            ->map(function (int $offset) use ($counts) {
                $date = today()->addDays($offset);

                return [
                    'label' => $date->format('D'),
                    'value' => (int) ($counts[$date->toDateString()] ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function monthlyTrend(): array
    {
        $start = today()->startOfMonth()->subMonths(5);

        $counts = Appointment::where('date', '>=', $start->toDateString())
            ->pluck('date')
            ->countBy(fn (string $date) => substr($date, 0, 7));

        return collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($counts) {
                $month = today()->subMonths($monthsAgo);

                return [
                    'label' => $month->format('M'),
                    'value' => (int) ($counts[$month->format('Y-m')] ?? 0),
                ];
            })
            ->values()
            ->all();
    }
}
