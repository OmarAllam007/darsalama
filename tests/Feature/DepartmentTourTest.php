<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

test('the pediatrics tour keeps source design and injects live doctors', function () {
    $department = Department::factory()->create([
        'slug' => 'pediatrics',
        'name' => 'Pediatrics',
    ]);

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Rabab Salem',
        'name_ar' => 'د. رباب سالم',
        'job' => 'Consultant Pediatrician',
        'job_ar' => 'استشاري طب الأطفال',
        'image' => 'doctors/rabab.jpg',
        'is_active' => true,
    ]);
    $doctor->qualifications()->create([
        'name' => 'Vaccinations & childhood illness',
        'name_ar' => 'التطعيمات وأمراض الأطفال',
    ]);
    $doctor->schedules()->create([
        'date' => Carbon::today(config('booking.timezone'))->addDay()->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '09:00', 'end' => '12:00', 'bookable' => true],
        ],
    ]);

    Http::fake([
        'darassalama.com/pediatrics.html' => Http::response(<<<'HTML'
<!doctype html><html><body class="lang-ar">
<section id="team">
  <div class="sec-head">
    <p class="s-sub"><span class="t-en">static summary</span></p>
  </div>
  <div class="docs-grid"><div class="docr old">OLD</div></div>
</section>
<a href="departments.html?book=rabab-salem">Book</a>
<a href="services.html">Services</a>
</body></html>
HTML),
    ]);

    $response = $this->get(route('departments.tour', 'pediatrics'));

    $response->assertOk()
        ->assertSee('class="docs-grid"', false)
        ->assertSee('Dr. Rabab Salem')
        ->assertSee('د. رباب سالم')
        ->assertSee(route('booking.show', $doctor))
        ->assertSee('data-booking-doctor="'.$doctor->id.'"', false)
        ->assertSee('data-booking-online="1"', false)
        ->assertSee("type: 'tour:book'", false)
        ->assertDontSee('departments.html?book=rabab-salem', false)
        ->assertSee(route('services'), false);
});

test('the obgyn tour injects live roster cards into the original doctors section', function () {
    $department = Department::factory()->create([
        'slug' => 'gynecology',
        'name' => 'Gynecology',
    ]);

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Muhannad Hamarsha',
        'name_ar' => 'د. مهند حمارشه',
        'job' => 'Consultant',
        'job_ar' => 'استشاري',
        'is_active' => true,
    ]);
    $doctor->qualifications()->create(['name' => 'Board certified', 'name_ar' => 'حاصل على البورد']);
    $doctor->services()->create(['name' => 'Antenatal care', 'name_ar' => 'متابعة الحمل']);

    Http::fake([
        'darassalama.com/obgyn.html' => Http::response(<<<'HTML'
<!doctype html><html><body>
<section class="snap bg-cream short" id="doctors">
  <div class="wrap">
    <div class="docs-grid"><article class="doc old">OLD</article></div>
  </div>
</section>
</body></html>
HTML),
    ]);

    $this->get(route('departments.tour', 'obgyn'))
        ->assertOk()
        ->assertSee('doc-nameplate', false)
        ->assertSee('Dr. Muhannad Hamarsha')
        ->assertSee(route('booking.show', $doctor));
});

test('unknown tour aliases return 404', function () {
    $this->get(route('departments.tour', 'unknown'))->assertNotFound();
});
