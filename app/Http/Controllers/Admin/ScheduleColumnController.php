<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorScheduleColumn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Maintains the sheet doctor-name → doctor map the monthly OPD import relies
 * on. Editing it here keeps workbook matching out of parser source code.
 */
class ScheduleColumnController extends Controller
{
    /**
     * Show every active doctor beside the sheet upload name it should match.
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
                    'upload_name' => $doctor->scheduleColumn?->upload_name,
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    /**
     * Save the whole map in one go — a blank upload name unmaps that doctor, which
     * simply excludes them from the next import.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'upload_names' => ['array'],
            'upload_names.*' => ['nullable', 'string', 'max:120'],
        ], [
            'upload_names.*.max' => 'Upload name must be 120 characters or fewer.',
        ]);

        $doctorIds = Doctor::query()->pluck('id')->all();
        $uploadNames = [];
        $normalizedToDoctors = [];

        foreach ($validated['upload_names'] ?? [] as $doctorId => $uploadName) {
            $uploadName = trim((string) $uploadName);
            $baseName = preg_split('/\s*[-–—]\s*|\s*\(/u', $uploadName, 2)[0] ?? $uploadName;
            $normalized = (string) Str::of($baseName)
                ->lower()
                ->replaceMatches('/\b(dr|doctor)\b\.?/u', '')
                ->replace('د.', '')
                ->replace('دكتور', '')
                ->replaceMatches('/[^[:alnum:]\x{0600}-\x{06FF}]+/u', '')
                ->trim();

            if ($uploadName !== '' && in_array((int) $doctorId, $doctorIds, true)) {
                $id = (int) $doctorId;
                $uploadNames[$id] = $uploadName;
                $normalizedToDoctors[$normalized][] = $id;
            }
        }

        $duplicates = array_filter(
            $normalizedToDoctors,
            fn (array $doctorMatches): bool => count($doctorMatches) > 1,
        );

        if ($duplicates !== []) {
            $byDoctor = Doctor::query()
                ->whereIn('id', array_merge(...array_values($duplicates)))
                ->pluck('name', 'id');

            $messages = collect($duplicates)
                ->map(function (array $ids, string $normalized) use ($byDoctor): string {
                    $names = collect($ids)->map(
                        fn (int $id): string => $byDoctor[$id] ?? "#{$id}",
                    )->implode(', ');

                    return "'{$normalized}' matches {$names}";
                })
                ->implode('; ');

            return back()->withErrors([
                'upload_names' => 'Duplicate upload names found. Please select which doctor each sheet name belongs to: '.$messages.'.',
            ]);
        }

        DB::transaction(function () use ($uploadNames): void {
            // Rewritten wholesale: doctors swapping columns would otherwise trip
            // the unique index halfway through the update.
            DoctorScheduleColumn::query()->delete();

            foreach ($uploadNames as $doctorId => $uploadName) {
                DoctorScheduleColumn::create([
                    'doctor_id' => $doctorId,
                    'upload_name' => $uploadName,
                    'column' => $this->legacyColumnFor($doctorId),
                ]);
            }
        });

        return back();
    }

    private function legacyColumnFor(int $doctorId): string
    {
        $number = max($doctorId, 1);
        $column = '';

        while ($number > 0) {
            $number--;
            $column = chr(65 + ($number % 26)).$column;
            $number = intdiv($number, 26);
        }

        return Str::take($column, 4);
    }
}
