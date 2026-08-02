<?php

use App\Models\SitePage;
use App\Models\User;

test('an authenticated admin can manage public page visibility', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.site-pages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/site-pages/index')
            ->has('pages', 6));

    $this->actingAs($user)
        ->put(route('admin.site-pages.update'), [
            'visible_pages' => ['about', 'doctors', 'services', 'contact', 'offers'],
        ])
        ->assertRedirect();

    expect(SitePage::query()->where('slug', 'obgyn')->value('is_visible'))->toBeFalse();
});

test('a hidden page returns not found', function () {
    SitePage::factory()->create([
        'slug' => 'obgyn',
        'is_visible' => false,
    ]);

    $this->get(route('obgyn'))->assertNotFound();
});

test('visible pages are shared with the public layout', function () {
    SitePage::factory()->create([
        'slug' => 'offers',
        'is_visible' => false,
    ]);

    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('visibleSitePages', fn ($pages) => ! collect($pages)->contains('offers')));
});

test('guests cannot open site page management', function () {
    $this->get(route('admin.site-pages.index'))
        ->assertRedirect(route('admin.login'));
});
