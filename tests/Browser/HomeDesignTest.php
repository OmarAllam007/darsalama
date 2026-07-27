<?php

it('renders the redesigned homepage and its primary actions', function () {
    $page = visit('/')->resize(1440, 1000);

    $page->assertSee('Everything you need, connected under one roof.')
        ->assertSee('Expertise and technology, delivered with genuine care')
        ->assertSee('Standards you can trust.')
        ->assertScript("document.querySelector('.home-hero__secondary')?.getAttribute('href')", '/services')
        ->assertScript("document.querySelector('.home-why__link')?.getAttribute('href')", '/doctors')
        ->assertScript("document.querySelectorAll('.hero__slide.is-active').length", 1)
        ->assertScript("getComputedStyle(document.querySelector('.hero__slide.is-active')).objectFit", 'cover')
        ->assertScript("Math.round(document.querySelector('.hero__slide.is-active').getBoundingClientRect().width) === Math.round(document.querySelector('.hero__slides').getBoundingClientRect().width)", true)
        ->assertScript("Math.round(document.querySelector('.hero__slide.is-active').getBoundingClientRect().height) === Math.round(document.querySelector('.hero__slides').getBoundingClientRect().height)", true)
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors();

    $page->click('button[aria-label="Next slide"]')
        ->assertScript("document.querySelector('.home-hero__count')?.textContent.replace(/\\s+/g, ' ').trim()", '02 / 04')
        ->assertScript("document.querySelector('.hero__dot.is-active')?.getAttribute('aria-current')", 'true')
        ->click('button[aria-label="Previous slide"]')
        ->assertScript("document.querySelector('.home-hero__count')?.textContent.replace(/\\s+/g, ' ').trim()", '01 / 04')
        ->screenshot(filename: 'home-redesign-desktop', fullPage: true);
});

it('keeps the redesigned homepage responsive in english and arabic', function () {
    $page = visit('/')->resize(390, 844);

    $page->assertSee('Care, thoughtfully delivered')
        ->assertSee('Ready to experience quality healthcare?')
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'home-redesign-mobile', fullPage: true);

    $page->select('.nav__lang:not(.nav__lang--mobile)', 'ar')
        ->wait(0.3);
    $page->script('window.scrollTo(0, 0)');

    $page->assertSee('كل ما تحتاجه، متكامل تحت سقف واحد.')
        ->assertSee('معايير تمنحك الثقة.')
        ->assertScript("document.documentElement.getAttribute('dir')", 'rtl')
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'home-redesign-mobile-ar', fullPage: true);
});
