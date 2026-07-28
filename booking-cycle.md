I have an existing Laravel hospital/clinic management application.

I need you to implement a complete Doctor Schedule Excel Import + Doctor Availability + Reception Calendar workflow.

IMPORTANT:
This is an existing production codebase.

Before changing anything:
- Inspect the existing project architecture.
- Inspect existing migrations.
- Inspect existing models and relationships.
- Inspect existing schedule logic.
- Inspect existing appointment/booking logic.
- Inspect existing patient logic.
- Inspect the admin frontend architecture.
- Inspect existing packages/libraries.

DO NOT redesign or duplicate functionality that already exists.

Do not make unrelated changes.

==================================================
1. EXISTING DATABASE STRUCTURE
==================================================

I already have a `doctors` table with approximately the following structure:

doctors
-------
id
code
department_id
nationality_id
name
name_ar
job
job_ar
image
is_active
created_at
updated_at

I also already have a `doctor_schedules` table:

doctor_schedules
----------------
id
doctor_id
date
status
windows
note
created_at
updated_at

The `doctor_schedules` table is already part of the application.

Do NOT create another doctor schedules table.

Before implementation, inspect:

- Doctor model
- DoctorSchedule model
- migrations
- casts
- services/actions
- controllers
- API resources
- frontend usage

Especially inspect how:

doctor_schedules.windows

is currently stored, cast, read, and written.

Reuse the existing structure whenever possible.

Do NOT introduce a doctor_schedule_slots table unless there is a very strong technical reason and the current architecture cannot support the required behavior.

==================================================
2. BUSINESS GOAL
==================================================

The hospital sends a monthly Excel schedule.

The Excel contains doctor schedules for multiple departments, for example:

- General Surgery
- Pediatric
- OB&GYN
- and potentially other departments later

Each department has multiple doctors.

Rows represent days of the month.

Columns represent doctors.

The hospital guarantees that each doctor will always remain in the same fixed Excel position/column.

The system should allow an administrator to:

1. Select month/year.
2. Upload the Excel file.
3. Parse doctor schedules.
4. Validate the file.
5. Preview detected changes.
6. Confirm the import.
7. Update doctor_schedules.
8. Use the imported availability inside a calendar interface.
9. Allow reception staff to manage/view appointments from the calendar.

The final workflow should be:

Excel Schedule
        ↓
Doctor Availability
        ↓
Admin Preview
        ↓
Confirmed Import
        ↓
doctor_schedules
        ↓
Appointment Availability
        ↓
Reception Calendar
        ↓
Patient Booking

==================================================
3. DOCTOR IDENTIFICATION
==================================================

VERY IMPORTANT:

DO NOT identify doctors using their names in Excel.

Doctor names in Excel may be:

- incomplete
- abbreviated
- misspelled
- formatted differently
- different from the database name

This is acceptable.

The hospital is responsible for maintaining each doctor in the agreed fixed Excel position.

Therefore the source of truth must be:

Excel position/column
→
doctor_id

NOT:

Excel doctor name
→
doctor_id

Example:

General Surgery:

Column C → doctor_id 12
Column D → doctor_id 18
Column E → doctor_id 25
Column F → doctor_id 30

The Excel name must NOT affect the import.

Do not block the import because the displayed doctor name differs from the database.

The doctor name can be displayed for human reference only.

==================================================
4. DOCTOR / EXCEL POSITION MAPPING
==================================================

Do NOT add something like:

excel_column

directly to the doctors table.

The Excel template configuration must be separate from doctor business data.

Create the simplest configurable mapping architecture that fits the existing project.

A possible structure could be:

schedule_templates
------------------
id
name
sheet_name
is_active
created_at
updated_at

schedule_template_doctors
-------------------------
id
schedule_template_id
doctor_id
department_id
excel_column
optional section identifier
created_at
updated_at

However:

DO NOT blindly create these tables.

First inspect the existing project.

If there is already a suitable configuration/table architecture, reuse it.

The important requirement is:

Excel position
→
doctor_id

must be configurable and must NOT be hardcoded throughout the parser.

==================================================
5. MONTH / DATE HANDLING
==================================================

The administrator should select the schedule month/year before uploading.

Example:

July 2026

The Excel contains rows such as:

Wed | 1
Thu | 2
Fri | 3
...

The system should combine:

selected month/year
+
day number

to create the actual date.

Example:

Selected month:
July 2026

Excel row:
1

Result:
2026-07-01

Do NOT rely only on parsing:

"General Surgery - July 2026"

from the Excel title.

The selected month/year should be the authoritative value.

Validate invalid dates.

Example:

February 30

must be rejected/reported.

==================================================
6. EXCEL CELL EXAMPLES
==================================================

Cells may contain values such as:

8:00-12:00

8:00-12:00; 16:00-20:00

10:00-14:00; 18:00-22:00

8:00-12:00 (OPD)

8:00-12:00 (ONLY)

8:00-12:00 (OPD) 12:00-16:00 (LTC)

8:00-12:00 (OR)

8:00-12:00 (OR) w/Neurosurgeon

OFF

V

No clinic

There may also be other codes in parentheses.

The parser must be flexible enough to parse multiple time ranges even when they are NOT separated by semicolons.

Example:

8:00-12:00 (OPD) 12:00-16:00 (LTC)

must be detected as TWO separate time ranges.

==================================================
7. AVAILABILITY BUSINESS RULES
==================================================

These rules are critical.

Availability must be determined PER TIME RANGE.

BOOKABLE codes:

- no code/symbol
- OPD
- ONLY

These mean that the corresponding time range is available for patient booking.

Examples:

8:00-12:00

means:

08:00 → 12:00
bookable = true

----------------------------

8:00-12:00 (OPD)

means:

08:00 → 12:00
code = OPD
bookable = true

----------------------------

8:00-12:00 (ONLY)

means:

08:00 → 12:00
code = ONLY
bookable = true

==================================================

ANY OTHER code/symbol means that the corresponding period is NOT available for patient booking.

For example:

8:00-12:00 (OPD) 12:00-16:00 (LTC)

means:

Window 1:

08:00 → 12:00
code = OPD
bookable = true

Window 2:

12:00 → 16:00
code = LTC
bookable = false

Therefore appointments may only be booked from:

08:00 → 12:00

The 12:00 → 16:00 period must NOT allow appointments.

==================================================

Another example:

8:00-12:00 (OR)

means:

08:00 → 12:00
code = OR
bookable = false

==================================================

Another example:

8:00-12:00 (OR) w/Neurosurgeon

means:

08:00 → 12:00
code = OR
bookable = false
note = "w/Neurosurgeon"

Do NOT discard this information.

==================================================
8. SPECIAL FULL-DAY VALUES
==================================================

Support existing values such as:

OFF
V
No clinic

These should represent non-bookable days.

Use the existing doctor_schedules.status conventions if they already exist.

Before adding new status values, inspect the current model/database/application behavior.

Conceptually:

OFF
→ off / unavailable

V
→ vacation / unavailable

No clinic
→ no_clinic / unavailable

But preserve existing application conventions.

==================================================
9. WINDOWS STORAGE
==================================================

Reuse:

doctor_schedules.windows

whenever possible.

Inspect its current structure before changing anything.

Conceptually, the imported schedule needs enough information to represent:

[
    {
        "start": "08:00",
        "end": "12:00",
        "code": "OPD",
        "bookable": true,
        "note": null
    },
    {
        "start": "12:00",
        "end": "16:00",
        "code": "LTC",
        "bookable": false,
        "note": null
    }
]

For a normal period:

8:00-12:00

conceptually:

{
    "start": "08:00",
    "end": "12:00",
    "code": null,
    "bookable": true,
    "note": null
}

For:

8:00-12:00 (ONLY)

conceptually:

{
    "start": "08:00",
    "end": "12:00",
    "code": "ONLY",
    "bookable": true,
    "note": null
}

For:

8:00-12:00 (OR) w/Neurosurgeon

conceptually:

{
    "start": "08:00",
    "end": "12:00",
    "code": "OR",
    "bookable": false,
    "note": "w/Neurosurgeon"
}

This is the conceptual requirement.

If the existing `windows` field already has another established structure, preserve backward compatibility and adapt the solution appropriately.

Do not unnecessarily break existing APIs/frontend code.

==================================================
10. IMPORTANT: DO NOT DISCARD BLOCKED WINDOWS
==================================================

Do NOT simply remove unavailable ranges from the imported schedule.

Example:

8:00-12:00 (OPD) 12:00-16:00 (LTC)

Do NOT store only:

08:00 → 12:00

Store BOTH periods.

The second period should exist as:

bookable = false

because the admin/reception calendar should be able to display:

08:00 → 12:00
Available

12:00 → 16:00
LTC - Unavailable

This gives reception staff visibility into WHY the doctor cannot receive appointments.

==================================================
11. BLANK CELLS
==================================================

Be very careful with blank Excel cells.

For the first implementation:

blank cell = no change

Do NOT automatically interpret a blank cell as:

OFF
Unavailable
No clinic

unless existing application business rules explicitly require this.

This prevents accidentally closing a doctor's schedule because someone forgot to fill a cell in Excel.

==================================================
12. EXCEL IMPORT ARCHITECTURE
==================================================

Do NOT place all Excel parsing logic inside a controller.

Use clean Laravel architecture consistent with the existing project.

Prefer dedicated classes/services/actions such as:

ScheduleExcelImportService
ScheduleCellParser
ScheduleImportPreviewService
ScheduleImportService

Names may change to match existing project conventions.

Responsibilities should be separated.

For example:

ScheduleCellParser:
- parse raw Excel cell
- identify time ranges
- identify codes
- determine bookable true/false
- preserve notes

ScheduleExcelImportService:
- read Excel
- map columns to doctors
- map rows to dates
- call parser
- produce normalized data

ScheduleImportPreviewService:
- compare imported schedule against existing doctor_schedules
- determine changes

ScheduleImportService:
- persist confirmed changes safely

==================================================
13. EXCEL LIBRARY
==================================================

Before installing anything, inspect composer.json and the existing project.

If:

maatwebsite/excel

already exists, use it.

Otherwise check whether:

PhpSpreadsheet

already exists.

Only introduce a new dependency if necessary.

Do not install unnecessary packages.

==================================================
14. UPLOAD WORKFLOW
==================================================

The admin workflow should be:

Select Month / Year
        ↓
Choose Excel File
        ↓
Upload & Preview
        ↓
Validate Template
        ↓
Parse Schedules
        ↓
Compare with Existing Schedules
        ↓
Display Preview
        ↓
Confirm Import
        ↓
Database Transaction
        ↓
Success Summary

Do NOT immediately modify doctor_schedules when the Excel file is uploaded.

Upload and preview must be separate from confirmation.

==================================================
15. IMPORT PREVIEW
==================================================

Before confirmation, display a clear preview.

The preview should show information such as:

Doctor
Department
Date
Current Schedule
Imported Schedule
Change Type
Warnings

Change types could include:

UNCHANGED
NEW
MODIFIED
OFF
VACATION
NO CLINIC
NO CHANGE
WARNING

Example:

Dr. Ehab
July 12, 2026

Current:
10:00 → 18:00

Excel:
14:00 → 22:00

Change:
MODIFIED

==================================================
16. IMPORT VALIDATION
==================================================

Validate at minimum:

- file type
- Excel file readability
- required template structure
- expected doctor columns/positions
- mapped doctor exists
- valid date
- valid time format
- start time < end time
- malformed time ranges
- overlapping ranges inside the same cell
- duplicate ranges
- unsupported cell content

IMPORTANT:

Do NOT validate doctor identity using the doctor's Excel name.

Position mapping is authoritative.

If the doctor name differs, the import should NOT fail.

==================================================
17. IMPORT DATABASE BEHAVIOR
==================================================

After confirmation:

Create/update doctor_schedules based on:

doctor_id + date

The import must be idempotent.

Uploading and confirming the exact same schedule twice must NOT create duplicate schedule rows.

Inspect whether:

doctor_id + date

is already unique.

If not, determine whether adding a unique constraint is safe based on the current application.

Do NOT blindly add the constraint before inspecting existing data and behavior.

Use updateOrCreate or an equivalent safe approach if appropriate.

==================================================
18. TRANSACTIONS / SAFETY
==================================================

The confirmed import must run inside a database transaction.

The import must be atomic.

If a fatal error occurs:

ROLLBACK

Do not leave the database partially updated.

Do NOT delete or modify schedules for:

- doctors not included in the configured Excel mapping
- dates outside the selected month
- unrelated departments

Only modify schedules explicitly covered by the confirmed import.

==================================================
19. IMPORT HISTORY / AUDIT
==================================================

Create a lightweight import history if there is no existing audit architecture.

A possible structure:

schedule_imports
----------------
id
month
year
original_filename
imported_by
status
summary
created_at
updated_at

Summary can be JSON.

Example:

{
    "doctors": 15,
    "processed_days": 31,
    "created": 20,
    "updated": 45,
    "unchanged": 200,
    "warnings": 2
}

This should allow administrators to know:

- who imported the schedule
- when
- which month
- which file
- how many schedules changed

Do not over-engineer full schedule versioning unless the existing project requires it.

==================================================
20. CALENDAR IS A CORE PART OF THE FEATURE
==================================================

After the Excel import feature, implement a proper calendar-based doctor schedule and appointment interface.

This calendar should become the primary operational interface for reception staff.

Do NOT make reception staff manage schedules using raw database-style forms and inputs.

The workflow must be visually understandable through the calendar.

==================================================
21. CALENDAR VIEWS
==================================================

Provide appropriate calendar views such as:

- Month
- Week
- Day

The most important operational views are:

Week
Day

The receptionist should be able to filter by:

- Department
- Doctor
- Date
- Appointment status where applicable

Example:

Department:
General Surgery

Doctor:
Dr. A. Taha

Date:
July 15, 2026

Then the calendar should display that doctor's actual availability and appointments.

==================================================
22. CALENDAR VISUALIZATION
==================================================

The calendar should clearly distinguish between:

1. Available/bookable doctor time
2. Unavailable doctor time
3. Existing booked appointments
4. Free appointment times

Example:

08:00 ─ Available
08:30 ─ Available
09:00 ─ Ahmed Ali
09:30 ─ Available
10:00 ─ Sara Mohamed
10:30 ─ Available
11:00 ─ Available
11:30 ─ Available

12:00 ─ LTC / Unavailable
12:30 ─ LTC / Unavailable
13:00 ─ LTC / Unavailable
...
16:00

Do not hide unavailable imported periods.

Display the code/reason where possible.

Examples:

LTC
OR
Surgery
etc.

==================================================
23. APPOINTMENTS / BOOKINGS
==================================================

Before implementing appointment/calendar functionality:

Inspect the existing project for:

- appointments table
- bookings table
- patient appointments
- reservations
- patient model
- appointment services
- appointment statuses
- appointment duration
- booking APIs
- existing reception workflow

Reuse existing functionality.

DO NOT create a second appointment/booking architecture if one already exists.

If appointment functionality does not exist, propose the smallest appropriate architecture before creating it.

Conceptually an appointment may need:

id
doctor_id
patient_id
date
start_time
end_time
status
note
created_by
created_at
updated_at

But do NOT blindly create this structure.

First inspect the current application.

==================================================
24. AVAILABILITY VS APPOINTMENTS
==================================================

Doctor availability and appointments are different concepts.

Doctor availability comes from:

doctor_schedules

Appointments represent actual patient bookings.

Example:

Doctor availability:

08:00 → 12:00

Appointment duration:

30 minutes

Existing appointments:

09:00 → 09:30
10:30 → 11:00

The free slots should be calculated from:

Doctor Bookable Availability
-
Existing Appointments
=
Available Appointment Times

Do NOT create database records for every empty/free appointment slot unless the existing system architecture specifically requires it.

Prefer calculating free slots dynamically.

==================================================
25. RECEPTION WORKFLOW
==================================================

The expected reception workflow is:

1. Receptionist opens the calendar.

2. Selects department.

3. Selects doctor.

4. Selects date or navigates using the calendar.

5. The system displays:
   - doctor's working periods
   - blocked periods
   - available booking times
   - existing appointments

6. Receptionist clicks a free available time.

7. A booking modal/panel opens.

8. Receptionist searches/selects the patient.

9. Receptionist creates the appointment.

10. The appointment immediately appears on the calendar.

The workflow should be fast and clear.

==================================================
26. BOOKED APPOINTMENT DISPLAY
==================================================

When an appointment exists, show the patient name inside the calendar event.

Example:

09:00 - 09:30
Ahmed Ali
Booked

Clicking the appointment should open a details modal/panel.

Display existing available information such as:

Patient
Patient contact information if appropriate
Doctor
Department
Date
Start time
End time
Appointment status
Notes
Created by

Use existing application fields and permissions.

Do not expose information the current user is not authorized to see.

==================================================
27. APPOINTMENT CREATION
==================================================

When reception clicks an available time:

Open a booking modal/panel.

The receptionist should be able to:

- search/select patient
- confirm doctor
- confirm date
- confirm time
- select appointment type if the existing system supports it
- enter notes if supported
- save appointment

After successful creation:

Update the calendar immediately.

==================================================
28. BACKEND BOOKING VALIDATION
==================================================

All appointment availability rules MUST be enforced by the backend.

Do NOT rely only on frontend/calendar validation.

Before creating an appointment, validate:

- doctor exists
- doctor is active where applicable
- doctor has a schedule for that date
- requested time is inside a bookable window
- requested time does NOT overlap a bookable=false window
- requested time does NOT fall outside imported availability
- requested time does NOT overlap an existing active appointment
- appointment duration is valid
- patient exists
- any existing application booking rules are satisfied

Example:

doctor_schedules.windows:

[
    {
        "start": "08:00",
        "end": "12:00",
        "code": "OPD",
        "bookable": true
    },
    {
        "start": "12:00",
        "end": "16:00",
        "code": "LTC",
        "bookable": false
    }
]

Appointment:

09:00 → 09:30

VALID.

Appointment:

13:00 → 13:30

INVALID.

==================================================
29. CONCURRENCY / DOUBLE BOOKING
==================================================

Prevent double booking.

Two receptionists may attempt to book the same doctor/time simultaneously.

Do not rely only on:

"check appointment then insert"

without considering concurrency.

Use the existing project's booking strategy if one exists.

Otherwise implement an appropriate transactional/locking strategy so two simultaneous requests cannot create overlapping appointments.

==================================================
30. APPOINTMENT DURATION
==================================================

Before implementing slot calculation, determine how appointment duration currently works.

It may be:

- globally configured
- department-specific
- doctor-specific
- appointment-type-specific
- already stored somewhere in the system

Reuse the existing business rule.

Do NOT hardcode 30 minutes unless the current application already uses 30 minutes.

If appointment duration does not exist anywhere, report this before deciding the final implementation.

==================================================
31. CALENDAR LIBRARY
==================================================

Inspect the frontend stack first.

Determine whether the project uses:

Blade
Livewire
Vue
React
Inertia
or another architecture.

Check whether a calendar library already exists.

If FullCalendar or an equivalent library already exists:

reuse it.

Otherwise propose an appropriate calendar library consistent with the current frontend stack.

Do not install unnecessary frontend dependencies.

==================================================
32. CALENDAR DATA API
==================================================

Design the calendar backend so the frontend can request data efficiently.

Do NOT load every doctor's schedule and every appointment for all time.

The calendar should query only the required date range and filters.

For example:

start
end
department_id
doctor_id

The backend should return enough information to display:

- available periods
- blocked periods
- appointments

Avoid N+1 queries.

Use appropriate eager loading and indexes based on existing architecture.

==================================================
33. PERFORMANCE
==================================================

The calendar will be used operationally by reception.

It should load quickly.

Pay attention to:

- indexes
- date range filtering
- doctor_id
- department_id
- appointment date/time
- eager loading
- avoiding N+1 queries
- avoiding unnecessary processing of schedules outside the visible calendar range

Do not prematurely over-engineer caching unless needed.

==================================================
34. UI/UX
==================================================

The calendar should be easy for non-technical reception staff.

Do not expose raw JSON windows or technical schedule fields.

Use clear visual states.

Examples:

Available
Booked
Unavailable
OFF
Vacation
No Clinic
LTC
OR

The calendar should make it immediately obvious:

- where an appointment can be created
- where it cannot be created
- which patient already has an appointment

Use the existing admin design system and components.

Do not introduce a completely different visual style.

==================================================
35. EXCEL IMPORT UI
==================================================

Create a clean admin page containing:

Schedule Month
Schedule Year
Excel File

[Upload & Preview]

After parsing:

Show import summary and preview.

Example:

Doctors processed: 15
Days processed: 31
New schedules: 12
Modified schedules: 25
Unchanged: 180
Warnings: 2

Then:

[Confirm Import]
[Cancel]

Do not save schedule changes until Confirm Import is explicitly executed.

==================================================
36. MAPPING MANAGEMENT UI
==================================================

The Excel doctor-position mapping should be manageable without editing source code.

Provide a simple admin configuration UI if consistent with the current admin architecture.

For example:

Department | Excel Column | Doctor

General Surgery | C | Dr. A. Taha
General Surgery | D | Dr. Ehab
General Surgery | E | Dr. Sarah

The exact UI can follow existing admin patterns.

The mapping must ultimately store:

Excel position
→
doctor_id

Do not rely on the Excel doctor's displayed name.

==================================================
37. ERROR HANDLING
==================================================

Do not silently ignore malformed schedule values.

If the parser cannot understand a cell, include it in the preview as a warning/error.

Example:

Doctor:
Dr. X

Date:
2026-07-15

Excel Value:
"8 morning maybe 12"

Result:
Unable to parse schedule.

The administrator should know which cell caused the problem.

Fatal structural problems should prevent confirmation.

Non-fatal warnings should be clearly displayed.

==================================================
38. TESTING
==================================================

Add automated tests consistent with the existing test suite.

At minimum cover the schedule parser.

Test examples:

"8:00-12:00"

Expected:
one bookable window.

----------------------------------

"8:00-12:00 (OPD)"

Expected:
one bookable OPD window.

----------------------------------

"8:00-12:00 (ONLY)"

Expected:
one bookable ONLY window.

----------------------------------

"8:00-12:00 (LTC)"

Expected:
one non-bookable LTC window.

----------------------------------

"8:00-12:00 (OPD) 12:00-16:00 (LTC)"

Expected:
two windows.

Window 1:
08:00-12:00
OPD
bookable=true

Window 2:
12:00-16:00
LTC
bookable=false

----------------------------------

"8:00-12:00; 16:00-20:00"

Expected:
two bookable windows.

----------------------------------

"8:00-12:00 (OR) w/Neurosurgeon"

Expected:
08:00-12:00
OR
bookable=false
note preserved

----------------------------------

"OFF"

Expected:
non-bookable/off day.

----------------------------------

"V"

Expected:
vacation/non-bookable.

----------------------------------

"No clinic"

Expected:
non-bookable/no clinic.

Also test:

- blank cell behavior
- malformed time
- overlapping ranges
- duplicate ranges
- invalid dates
- idempotent imports
- import transaction rollback
- appointment inside bookable window
- appointment outside bookable window
- appointment inside LTC/OR blocked period
- overlapping appointments
- double-booking protection where practical

==================================================
39. IMPORTANT IMPLEMENTATION PRINCIPLES
==================================================

Follow these principles:

1. Reuse existing architecture.

2. Do not create duplicate tables/models/services for functionality that already exists.

3. Keep the existing doctors table.

4. Keep the existing doctor_schedules table.

5. Reuse doctor_schedules.windows.

6. Preserve backward compatibility where possible.

7. Doctor identification from Excel is based on FIXED POSITION, not name.

8. No code / OPD / ONLY = bookable.

9. Any other code = non-bookable for that specific time range.

10. Preserve non-bookable ranges for calendar visualization.

11. Blank Excel cells = no change.

12. Upload does NOT immediately modify schedules.

13. Preview before confirmation.

14. Confirmed import must be transactional.

15. Import must be idempotent.

16. Calendar is the primary reception operational interface.

17. Availability comes from doctor_schedules.

18. Appointments come from the existing booking architecture.

19. Free slots are calculated from availability minus appointments.

20. Backend must enforce booking availability.

21. Prevent double booking.

22. Do not hardcode appointment duration without inspecting existing configuration.

23. Do not make unrelated refactors.

==================================================
40. FIRST STEP — INSPECT BEFORE CODING
==================================================

DO NOT start coding immediately.

First inspect the existing project and give me a concise implementation report.

I need you to tell me:

1. How Doctor and DoctorSchedule models currently work.

2. How doctor_schedules.windows is currently stored and cast.

3. What values doctor_schedules.status currently supports.

4. Whether doctor_id + date is currently unique.

5. Whether appointment/booking functionality already exists.

6. Which appointment-related tables/models/services currently exist.

7. Which patient model/table is currently used.

8. How appointment duration is currently determined.

9. Whether schedule/appointment availability logic already exists.

10. Which Excel library is already installed.

11. Which frontend/admin stack is being used.

12. Whether a calendar library is already installed.

13. Which new migrations/tables you believe are actually necessary.

14. Which existing files need modification.

15. Which new files/classes you propose creating.

16. How you propose storing the normalized windows while maintaining backward compatibility.

17. How free appointment slots will be calculated.

18. How you will prevent double booking.

19. How the Excel fixed-position doctor mapping will be configured.

20. Any assumptions or business-rule conflicts you discovered.

Then provide the proposed implementation phases.

Do NOT modify the code until this inspection and implementation plan is complete.

After presenting the plan, wait for my approval before implementing anything.

Do not make unrelated changes.