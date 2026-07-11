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
        && $mail->hasTo(config('mail.admin_address')));
});

test('name, phone, and preferred contact are required', function () {
    $doctor = Doctor::factory()->create();

    $response = $this->post(route('doctors.callback-requests.store', $doctor), []);

    $response->assertSessionHasErrors(['name', 'phone', 'preferred_contact']);
    expect(CallbackRequest::count())->toBe(0);
});
