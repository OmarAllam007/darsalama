<?php

use App\Mail\ContactMessageConfirmation;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Mail;

test('a contact message is saved and both parties receive an email', function () {
    Mail::fake();
    config()->set('mail.contact_address', 'info@as-salama.com');

    $this->post(route('contact-messages.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '512345678',
        'subject' => 'Appointment question',
        'message' => 'Please contact me about an appointment.',
    ])->assertRedirect();

    $contactMessage = ContactMessage::query()->sole();

    expect($contactMessage)
        ->email->toBe('jane@example.com')
        ->status->toBe('new');

    Mail::assertSent(ContactMessageReceived::class, function (ContactMessageReceived $mail): bool {
        return $mail->hasTo('info@as-salama.com')
            && $mail->hasReplyTo('jane@example.com');
    });
    Mail::assertSent(ContactMessageConfirmation::class, 'jane@example.com');
});

test('the confirmation tells the sender that the hospital received the message', function () {
    $contactMessage = ContactMessage::factory()->make([
        'name' => 'Jane Doe',
        'subject' => 'Appointment question',
    ]);

    $mail = new ContactMessageConfirmation($contactMessage);

    $mail->assertSeeInHtml('We received your message');
    $mail->assertSeeInHtml('Appointment question');
});

test('contact message fields are validated', function (array $data, string $field) {
    Mail::fake();

    $this->post(route('contact-messages.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '512345678',
        'subject' => 'Appointment question',
        'message' => 'Please contact me.',
        ...$data,
    ])->assertSessionHasErrors($field);

    expect(ContactMessage::query()->count())->toBe(0);
    Mail::assertNothingSent();
})->with([
    'name is required' => [['name' => ''], 'name'],
    'email is valid' => [['email' => 'not-an-email'], 'email'],
    'phone is Saudi mobile' => [['phone' => '123'], 'phone'],
    'subject is required' => [['subject' => ''], 'subject'],
    'message is required' => [['message' => ''], 'message'],
]);
