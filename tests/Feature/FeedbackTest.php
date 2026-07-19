<?php

use App\Mail\NegativeFeedbackReceived;
use App\Models\Feedback;
use Illuminate\Support\Facades\Mail;

test('feedback is stored', function () {
    Mail::fake();

    $response = $this->post(route('feedback.store'), [
        'rating' => 'good',
        'notes' => 'Great experience',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('feedback', [
        'rating' => 'good',
        'notes' => 'Great experience',
        'status' => 'new',
    ]);
});

test('a negative rating alerts the follow-up address', function (string $rating) {
    Mail::fake();
    config()->set('mail.feedback_address', 'nasscrg@as-salama.com');

    $this->post(route('feedback.store'), [
        'rating' => $rating,
        'mobile' => '0512345678',
        'notes' => 'Please follow up',
    ])->assertRedirect();

    Mail::assertSent(NegativeFeedbackReceived::class, function (NegativeFeedbackReceived $mail) {
        return $mail->hasTo('nasscrg@as-salama.com');
    });
})->with(['terrible', 'bad']);

test('a positive rating does not send an alert', function (string $rating) {
    Mail::fake();

    $this->post(route('feedback.store'), [
        'rating' => $rating,
    ])->assertRedirect();

    Mail::assertNothingSent();
})->with(['okay', 'good', 'excellent']);

test('the mobile number is required for negative ratings', function () {
    Mail::fake();

    $this->post(route('feedback.store'), [
        'rating' => 'bad',
    ])->assertSessionHasErrors('mobile');

    expect(Feedback::count())->toBe(0);
    Mail::assertNothingSent();
});

test('a rating is required and must be valid', function () {
    $this->post(route('feedback.store'), [
        'rating' => 'amazing',
    ])->assertSessionHasErrors('rating');
});
