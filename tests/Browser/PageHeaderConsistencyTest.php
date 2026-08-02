<?php

it('uses the shared cinematic header across doctors services and contact', function () {
    $doctors = visit('/doctors')->resize(1440, 900);

    $doctors->assertSee('Our Expert Medical Team')
        ->assertSee('Browse Departments')
        ->assertSee('Browse Doctors')
        ->assertScript("document.querySelector('.page-banner')?.getBoundingClientRect().height >= 600", true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-doctors-desktop');

    $services = visit('/services')->resize(1440, 900);

    $services->assertSee('Our Medical Services')
        ->assertScript("document.querySelector('.page-banner')?.getBoundingClientRect().height >= 600", true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-services-desktop');

    $contact = visit('/contact')->resize(1440, 900);

    $contact->assertSee('Get In Touch')
        ->assertScript("document.querySelector('.page-banner')?.getBoundingClientRect().height >= 600", true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-contact-desktop');
});

it('keeps the shared page headers responsive in arabic', function () {
    $page = visit('/doctors')->resize(390, 844);

    $page->select('.nav__lang:not(.nav__lang--mobile)', 'ar')
        ->wait(0.3)
        ->assertSee('فريقنا الطبي المتميز')
        ->assertSee('تصفّح الأقسام')
        ->assertScript("document.documentElement.getAttribute('dir')", 'rtl')
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-doctors-mobile-ar');

    $page->navigate('/services')
        ->assertSee('خدماتنا الطبية')
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-services-mobile-ar');

    $page->navigate('/contact')
        ->assertSee('تواصل معنا')
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.page-banner', filename: 'header-contact-mobile-ar');
});

it('keeps the contact feedback heading clear of the hero divider', function () {
    $page = visit('/contact')->resize(1440, 900);

    $page->assertScript(
        <<<'JS'
        (() => {
            const hero = document.querySelector('.page-banner').getBoundingClientRect();
            const card = document.querySelector('.contact-feedback__card').getBoundingClientRect();
            const intro = document.querySelector('.contact-feedback__card .section-intro').getBoundingClientRect();
            const cardLayer = Number(getComputedStyle(document.querySelector('.contact-feedback__card')).zIndex);

            return card.top < hero.bottom
                && intro.top > hero.bottom
                && cardLayer > 3;
        })()
        JS,
        true,
    )
        ->assertNoJavaScriptErrors()
        ->screenshotElement(
            '.contact-feedback__card',
            filename: 'contact-feedback-card-desktop',
        );

    $page->resize(390, 844)
        ->assertScript(
            <<<'JS'
            (() => {
                const hero = document.querySelector('.page-banner').getBoundingClientRect();
                const card = document.querySelector('.contact-feedback__card').getBoundingClientRect();

                return card.top > hero.bottom;
            })()
            JS,
            true,
        )
        ->assertScript(
            'document.documentElement.scrollWidth <= document.documentElement.clientWidth',
            true,
        )
        ->assertNoJavaScriptErrors();
});

it('renders the patient contact desk across desktop and mobile', function () {
    $page = visit('/contact')->resize(1440, 1000);

    $page->assertSee('A direct line to your care team')
        ->assertSee('Send Us A Message')
        ->assertSee('All services')
        ->assertScript(
            "getComputedStyle(document.querySelector('.contact-connect__shell')).gridTemplateColumns.split(' ').length > 1",
            true,
        )
        ->assertScript(
            'document.documentElement.scrollWidth <= document.documentElement.clientWidth',
            true,
        )
        ->click('.rating-card:last-child')
        ->wait(0.1)
        ->assertScript(
            "document.querySelector('.feedback-form') !== null",
            true,
        )
        ->assertScript(
            <<<'JS'
            (() => {
                const picker = document.querySelector('.rating-picker').getBoundingClientRect();
                const form = document.querySelector('.feedback-form').getBoundingClientRect();

                return form.top >= picker.bottom
                    && Math.abs(form.left - picker.left) <= 2
                    && Math.abs(form.width - picker.width) <= 2;
            })()
            JS,
            true,
        )
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.contact-feedback__card', filename: 'contact-feedback-form-desktop')
        ->screenshotElement('.contact-body', filename: 'contact-desk-desktop');

    $page->resize(390, 844)
        ->assertScript(
            "getComputedStyle(document.querySelector('.contact-connect__shell')).gridTemplateColumns.split(' ').length === 1",
            true,
        )
        ->assertScript(
            'document.documentElement.scrollWidth <= document.documentElement.clientWidth',
            true,
        )
        ->assertNoJavaScriptErrors()
        ->screenshotElement('.contact-body', filename: 'contact-desk-mobile');
});
