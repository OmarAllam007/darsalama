<?php

use App\Mail\CallbackRequestReceived;
use App\Models\CallbackRequest;
use App\Models\Doctor;
use Illuminate\Support\Facades\Mail;

test('a guest can submit a callback request and the admin is notified', function () {
    Mail::fake();

    $doctor = Doctor::factory()->create();

    $response = $this->post(route('doctors.callback-requests.store', $doctor), [
        'name' => 'Jane Doe',
        'phone' => '0500000000',
        'package_of_interest' => 'Women\'s Health Package',
        'best_time' => 'Morning',
        'preferred_contact' => 'whatsapp',
        'notes' => 'Please call after 5pm',
    ]);

    $response->assertRedirect();

    $callbackRequest = CallbackRequest::sole();
    expect($callbackRequest)
        ->doctor_id->toBe($doctor->id)
        ->name->toBe('Jane Doe')
        ->preferred_contact->toBe('whatsapp');

    Mail::assertSent(CallbackRequestReceived::class, fn ($mail) => $mail->callbackRequest->is($callbackRequest)
        && $mail->hasTo('norah.alawwad@as-salama.com')
        && $mail->hasTo('abdulaziz.meshal@as-salama.com')
        && ! $mail->hasTo('hello@example.com'));
});

test('the callback request email presents the follow-up details clearly', function () {
    $doctor = Doctor::factory()->create(['name' => 'Dr. Sarah Ahmed']);
    $callbackRequest = CallbackRequest::factory()->for($doctor)->create([
        'name' => 'Jane Doe',
        'phone' => '0500000000',
        'package_of_interest' => 'Women\'s Health Package',
        'best_time' => 'Morning',
        'preferred_contact' => 'whatsapp',
        'notes' => 'Please call after 5pm',
    ]);

    $mailable = new CallbackRequestReceived($callbackRequest);

    $mailable->assertHasSubject('New callback request from Jane Doe');
    $mailable->assertSeeInOrderInHtml([
        'New Callback Request',
        'Follow-up requested',
        'Patient Details',
        'Jane Doe',
        '0500000000',
        'WhatsApp',
        'Care Preferences',
        'Dr. Sarah Ahmed',
        'Women\'s Health Package',
        'Morning',
        'Patient Notes',
        'Please call after 5pm',
        'Review Callback Request',
    ]);
    $mailable->assertSeeInHtml(route('admin.callback-requests.index'));
});

test('the phone number must be a saudi mobile', function (string $phone, bool $valid) {
    Mail::fake();
    $doctor = Doctor::factory()->create();

    $response = $this->post(route('doctors.callback-requests.store', $doctor), [
        'name' => 'Jane Doe',
        'phone' => $phone,
        'preferred_contact' => 'phone',
    ]);

    $valid
        ? $response->assertSessionHasNoErrors()
        : $response->assertSessionHasErrors('phone');

    expect(CallbackRequest::count())->toBe($valid ? 1 : 0);
})->with([
    ['500000000', true],
    ['0500000000', true],
    ['call me please', false],
    ['05000000ab', false],
    ['400000000', false],
    ['5000000', false],
    ['+966500000000', false],
]);

test('a one letter name is rejected', function () {
    $doctor = Doctor::factory()->create();

    $this->post(route('doctors.callback-requests.store', $doctor), [
        'name' => 'J',
        'phone' => '500000000',
        'preferred_contact' => 'phone',
    ])->assertSessionHasErrors('name');
});

test('the preferred contact must be phone or whatsapp', function () {
    $doctor = Doctor::factory()->create();

    $this->post(route('doctors.callback-requests.store', $doctor), [
        'name' => 'Jane Doe',
        'phone' => '500000000',
        'preferred_contact' => 'carrier pigeon',
    ])->assertSessionHasErrors('preferred_contact');
});

test('name, phone, and preferred contact are required', function () {
    $doctor = Doctor::factory()->create();

    $response = $this->post(route('doctors.callback-requests.store', $doctor), []);

    $response->assertSessionHasErrors(['name', 'phone', 'preferred_contact']);
    expect(CallbackRequest::count())->toBe(0);
});
