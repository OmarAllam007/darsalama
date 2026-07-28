<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduleImport;
use App\Support\ScheduleImporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * Upload → preview → confirm for the hospital's monthly OPD workbook.
 *
 * Uploading never touches a schedule. The file is parked on disk, the diff is
 * shown, and only an explicit confirmation re-reads that same file and writes.
 */
class ScheduleImportController extends Controller
{
    // ponytail: an abandoned preview leaves its ~50KB upload behind; add a
    // scheduled prune of this directory if the files ever add up.
    private const DIRECTORY = 'schedule-imports';

    /** Rows sent to the browser; the summary still counts every one. */
    private const PREVIEW_LIMIT = 400;

    public function __construct(private ScheduleImporter $importer) {}

    /**
     * The upload form plus the log of previous imports.
     */
    public function index(): Response
    {
        return Inertia::render('admin/schedule-imports/index', [
            'history' => $this->history(),
            'defaultMonth' => Carbon::now()->addMonth()->format('Y-m'),
        ]);
    }

    /**
     * Parse the upload and show what it would change. Writes nothing.
     */
    public function preview(Request $request): Response|RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $month = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $token = (string) Str::uuid();

        $request->file('file')->storeAs(self::DIRECTORY, "{$token}.xlsx");

        try {
            $preview = $this->importer->preview($this->pathFor($token), $month);
        } catch (InvalidArgumentException $e) {
            Storage::delete(self::DIRECTORY."/{$token}.xlsx");

            return back()->withErrors(['file' => $e->getMessage()]);
        }

        $request->session()->put("schedule-import.{$token}", [
            'month' => $month->format('Y-m'),
            'filename' => $request->file('file')->getClientOriginalName(),
        ]);

        return Inertia::render('admin/schedule-imports/index', [
            'history' => $this->history(),
            'defaultMonth' => $month->format('Y-m'),
            'preview' => [
                'token' => $token,
                'month' => $month->format('Y-m'),
                'filename' => $request->file('file')->getClientOriginalName(),
                'summary' => $preview['summary'],
                'warnings' => $preview['warnings'],
                'rows' => $this->reviewable($preview['rows']),
            ],
        ]);
    }

    /**
     * Apply a previewed workbook inside a single transaction and log the result.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['token' => ['required', 'uuid']]);

        $pending = $request->session()->pull("schedule-import.{$validated['token']}");

        if ($pending === null || ! Storage::exists(self::DIRECTORY."/{$validated['token']}.xlsx")) {
            return back()->withErrors(['token' => 'That preview has expired. Upload the file again.']);
        }

        $month = Carbon::createFromFormat('Y-m', $pending['month'])->startOfMonth();

        try {
            $result = $this->importer->apply($this->pathFor($validated['token']), $month);
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['file' => $e->getMessage()]);
        } finally {
            Storage::delete(self::DIRECTORY."/{$validated['token']}.xlsx");
        }

        ScheduleImport::create([
            'month' => $month->toDateString(),
            'original_filename' => $pending['filename'],
            'imported_by' => $request->user()?->id,
            'summary' => $result['summary'],
        ]);

        return to_route('admin.schedule-imports.index')->with('import', $result['summary']);
    }

    /**
     * Only cells the administrator has to look at — everything unchanged is left
     * to the summary counts.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function reviewable(array $rows): array
    {
        $reviewable = array_values(array_filter(
            $rows,
            fn (array $row): bool => $row['change'] !== ScheduleImporter::CHANGE_UNCHANGED,
        ));

        return array_map(
            // The parsed windows are for `apply()`, not for the reviewer's screen.
            fn (array $row): array => Arr::except($row, ['status', 'windows']),
            array_slice($reviewable, 0, self::PREVIEW_LIMIT),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function history(): array
    {
        return ScheduleImport::with('importedBy:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (ScheduleImport $import): array => [
                'id' => $import->id,
                'month' => $import->month->format('F Y'),
                'filename' => $import->original_filename,
                'imported_by' => $import->importedBy?->name,
                'imported_at' => $import->created_at?->toDayDateTimeString(),
                'summary' => $import->summary,
            ])
            ->all();
    }

    private function pathFor(string $token): string
    {
        return Storage::path(self::DIRECTORY."/{$token}.xlsx");
    }
}
