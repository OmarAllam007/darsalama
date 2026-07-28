<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorScheduleColumn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Maintains the Excel-column → doctor map the monthly OPD import relies on.
 * Editing it here is what keeps the mapping out of the parser's source code.
 */
class ScheduleColumnController extends Controller
{
    /**
     * Show every active doctor beside the workbook column they occupy.
     */
    public function index(): Response
    {
        $departments = Department::whereHas('doctors', fn ($query) => $query->where('is_active', true))
            ->with([
                'doctors' => fn ($query) => $query->where('is_active', true)->with('scheduleColumn')->orderBy('name'),
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/schedule-columns/index', [
            'departments' => $departments->map(fn (Department $department): array => [
                'id' => $department->id,
                'name' => $department->name,
                'doctors' => $department->doctors->map(fn (Doctor $doctor): array => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'column' => $doctor->scheduleColumn?->column,
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    /**
     * Save the whole map in one go — a blank column unmaps that doctor, which
     * simply excludes them from the next import.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'columns' => ['array'],
            'columns.*' => ['nullable', 'string', 'regex:/^[A-Za-z]{1,3}$/'],
        ], [
            'columns.*.regex' => 'Use a spreadsheet column letter such as C or BZ.',
        ]);

        $doctorIds = Doctor::query()->pluck('id')->all();
        $columns = [];

        foreach ($validated['columns'] ?? [] as $doctorId => $column) {
            $column = mb_strtoupper(trim((string) $column));

            if ($column !== '' && in_array((int) $doctorId, $doctorIds, true)) {
                $columns[(int) $doctorId] = $column;
            }
        }

        $duplicates = array_unique(array_diff_assoc($columns, array_unique($columns)));

        if ($duplicates !== []) {
            return back()->withErrors([
                'columns' => 'Each column can hold one doctor. Repeated: '.implode(', ', $duplicates).'.',
            ]);
        }

        DB::transaction(function () use ($columns): void {
            // Rewritten wholesale: doctors swapping columns would otherwise trip
            // the unique index halfway through the update.
            DoctorScheduleColumn::query()->delete();

            foreach ($columns as $doctorId => $column) {
                DoctorScheduleColumn::create(['doctor_id' => $doctorId, 'column' => $column]);
            }
        });

        return back();
    }
}
