<?php

use App\Models\Feedback;
use App\Models\User;

test('guests are redirected to login', function () {
    $this->get(route('admin.feedback.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can view submitted feedback', function () {
    $this->actingAs(User::factory()->create());
    $feedback = Feedback::factory()->create(['notes' => 'Very kind staff']);

    $this->get(route('admin.feedback.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/feedback/index')
                ->has('feedback.data', 1)
                ->where('feedback.data.0.id', $feedback->id)
        );
});
