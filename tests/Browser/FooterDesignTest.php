<?php

it('renders the redesigned footer across desktop and mobile viewports', function () {
    $page = visit('/')->resize(1440, 1000);

    $page->script("document.getElementById('footer').scrollIntoView()");
    $page->wait(0.3)
        ->assertSee('Your health should never have to wait.')
        ->assertSee('Care when you need it')
        ->assertSee('Emergency care')
        ->assertSee('Open 24 hours, every day')
        ->assertNoJavaScriptErrors()
        ->screenshotElement('#footer', filename: 'footer-desktop');

    $page->resize(390, 844);
    $page->script("document.getElementById('footer').scrollIntoView()");
    $page->wait(0.3)
        ->assertSee('Your health should never have to wait.')
        ->assertSee('Book an appointment')
        ->assertNoJavaScriptErrors()
        ->screenshotElement('#footer', filename: 'footer-mobile');
});

it('keeps the redesigned footer readable in arabic', function () {
    $page = visit('/')->resize(1440, 900);

    $page->select('.nav__lang:not(.nav__lang--mobile)', 'ar')
        ->wait(0.3)
        ->resize(390, 844);
    $page->script("document.getElementById('footer').scrollIntoView()");

    $page->assertSee('صحتك لا تحتمل الانتظار.')
        ->assertSee('نعمل على مدار الساعة يوميًا')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'footer-mobile-ar');
});

it('links to the hospital social media profiles', function () {
    visit('/')
        ->assertAttribute(
            'a[aria-label="Instagram"]',
            'href',
            'https://www.instagram.com/daras_salamahospital?igsh=MTJkaGFiazNteXpsdA=='
        )
        ->assertAttribute(
            'a[aria-label="LinkedIn"]',
            'href',
            'https://www.linkedin.com/company/dar-as-salama-medical-hospital/'
        )
        ->assertAttribute(
            'a[aria-label="Facebook"]',
            'href',
            'https://www.facebook.com/dar.assalamahos?mibextid=wwXIfr'
        )
        ->assertAttribute('a[aria-label="Instagram"]', 'target', '_blank')
        ->assertNoJavaScriptErrors();
});
