<?php

test('the contact page exposes the configured google review url', function () {
    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('site/contact')
                ->where('googleReviewUrl', config('services.google.review_url'))
        );
});
