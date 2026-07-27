<?php

it('renders the redesigned about page across desktop and mobile viewports', function () {
    $page = visit('/about')->resize(1440, 1000);

    $page->assertSee('A legacy of care, built with Khobar.')
        ->assertSee('Our Core Values')
        ->assertSee('Our Journey')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-about-desktop', fullPage: true);

    $page->resize(390, 844)
        ->assertSee('Discover our story')
        ->assertSee('Since')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-about-mobile', fullPage: true);
});

it('renders the redesigned offers gallery and changes the featured offer', function () {
    $page = visit('/offers')->resize(1440, 1000);

    $page->assertSee('Care made accessible')
        ->assertSee('Explore our current packages')
        ->assertSee('Featured package')
        ->assertScript("document.querySelector('.offers-dsm__controls strong')?.textContent.trim()", '01')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-offers-desktop', fullPage: true);

    $page->click('button[aria-label="Next offer"]')
        ->assertScript("document.querySelector('.offers-dsm__controls strong')?.textContent.trim()", '02')
        ->resize(390, 844)
        ->assertSee('Book an appointment')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-offers-mobile', fullPage: true);
});

it('keeps both editorial pages readable in arabic', function () {
    $about = visit('/about')->resize(390, 844);

    $about->select('.nav__lang:not(.nav__lang--mobile)', 'ar')
        ->wait(0.3)
        ->assertSee('إرث من الرعاية، نما مع مدينة الخبر.')
        ->assertSee('قيمنا الأساسية')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-about-mobile-ar');

    $offers = visit('/offers')->resize(390, 844);

    $offers->select('.nav__lang:not(.nav__lang--mobile)', 'ar')
        ->wait(0.3)
        ->assertSee('رعاية في متناولك')
        ->assertSee('باقة مميزة')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'site-offers-mobile-ar');
});
