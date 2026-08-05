<?php

it('switches department when the wheel passes over a closed panel', function () {
    $page = visit('/services')->resize(1440, 1000);

    $page->assertScript("document.querySelector('.department-panel.is-active')?.dataset.dept", 'obgyn')
        ->assertNoJavaScriptErrors();

    $page->script("document.querySelector('[data-dept=\"pedia\"]').dispatchEvent(new WheelEvent('wheel', {deltaY: 120, bubbles: true, cancelable: true}))");
    $page->wait(0.3);

    $page->assertScript("document.querySelector('.department-panel.is-active')?.dataset.dept", 'pedia');
});

it('hangs scroll at the services end, fills the progress bar, then opens the tour', function () {
    $page = visit('/services')->resize(1440, 1000);

    // Scroll to the hang point (end of the services block — not into the footer).
    $page->script(<<<'JS'
        (() => {
            const root = document.querySelector('.services-tour');
            const endY = Math.max(0, root.offsetTop + root.offsetHeight - window.innerHeight);
            window.scrollTo(0, endY);
        })()
        JS);
    $page->wait(0.3);

    $page->assertScript("document.querySelector('.services-tour__hint').classList.contains('is-visible')", true)
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true);

    // Trying to scroll past the hang point must not reveal the footer.
    $page->script('window.scrollTo(0, document.body.scrollHeight)');
    $page->wait(0.2);
    $page->assertScript(<<<'JS'
        (() => {
            const root = document.querySelector('.services-tour');
            const endY = Math.max(0, root.offsetTop + root.offsetHeight - window.innerHeight);
            const footer = document.querySelector('.footer');
            const footerTop = footer?.getBoundingClientRect().top ?? 0;

            return window.scrollY <= endY + 4
                && footerTop >= window.innerHeight - 8;
        })()
        JS, true);

    // One notch of wheel fills part of the gauge without entering the tour yet.
    $page->script("window.dispatchEvent(new WheelEvent('wheel', {deltaY: 120, cancelable: true}))");
    $page->assertScript("document.querySelector('.department-panel.is-active .department-panel__push > span').style.transform !== 'scaleX(0)'", true)
        ->assertScript("document.querySelectorAll('.services-tour__frame').length", 0);

    // Pushing past the threshold walks into the department.
    $page->script("window.dispatchEvent(new WheelEvent('wheel', {deltaY: 120, cancelable: true})); window.dispatchEvent(new WheelEvent('wheel', {deltaY: 120, cancelable: true}))");
    $page->wait(0.6);

    $page->assertScript("document.body.classList.contains('services-tour-open')", true)
        ->assertScript("document.querySelector('.services-tour__frame.is-active iframe')?.getAttribute('src')", '/departments/tour/obgyn')
        ->assertScript("document.querySelector('.tour-tab.is-active')?.textContent.trim()", 'OB / GYN')
        // The services page underneath is out of the way while the tour is up.
        ->assertScript("getComputedStyle(document.querySelector('.department-tour')).display", 'none')
        ->assertScript('location.pathname', '/services');
});

it('switches and closes tours from the overlay bar', function () {
    $page = visit('/services')->resize(1440, 1000);

    $page->click('.department-panel.is-active .department-panel__action button')
        ->wait(0.6)
        ->assertScript("document.querySelector('.services-tour__frame.is-active iframe')?.getAttribute('src')", '/departments/tour/obgyn');

    // Every tour keeps its frame, so switching back never reloads it.
    $page->click('.tour-tab--dental')
        ->wait(0.5)
        ->assertScript("document.querySelector('.services-tour__frame.is-active iframe')?.getAttribute('src')", '/departments/tour/dental')
        ->assertScript("document.querySelectorAll('.services-tour__frame').length", 2);

    // Dietary is not ready, so its tab says so instead of switching.
    $page->click('.tour-tab--diet')
        ->wait(0.4)
        ->assertScript("document.querySelector('.services-tour__notice').classList.contains('is-visible')", true)
        ->assertScript("document.querySelector('.tour-tab.is-active')?.classList.contains('tour-tab--dental')", true);

    $page->click('.services-tour__fs-close')
        ->wait(0.5)
        ->assertScript("document.body.classList.contains('services-tour-open')", false)
        ->assertScript("document.querySelectorAll('.services-tour__fs').length", 0)
        ->assertNoJavaScriptErrors();
});

it('starts every department closed on phones and walks itself until touched', function () {
    $page = visit('/services')->resize(390, 844);

    $page->wait(0.6)
        ->assertScript("document.querySelectorAll('.department-panel.is-active').length", 0)
        ->assertScript("getComputedStyle(document.querySelector('.department-tour__tabs')).display", 'none');

    // The stack opens the first department by itself a few seconds in.
    $page->wait(3.5)
        ->assertScript("document.querySelector('.department-panel.is-active')?.dataset.dept", 'obgyn');

    // Tapping the unfinished department says so instead of opening it.
    $page->click('[data-dept="diet"]')
        ->wait(0.4)
        ->assertScript("document.querySelector('.services-tour__notice').classList.contains('is-visible')", true)
        ->assertScript("document.querySelector('[data-dept=\"diet\"]').classList.contains('is-active')", false);

    $page->click('[data-dept="psych"]')
        ->wait(0.8)
        ->assertScript("document.querySelector('[data-dept=\"psych\"]').classList.contains('is-active')", true)
        ->assertScript('document.documentElement.scrollWidth <= document.documentElement.clientWidth', true)
        ->assertNoJavaScriptErrors();
});

it('scrolls the overlay strip so the live tab stays in view on phones', function () {
    $page = visit('/services')->resize(390, 844);

    $page->wait(0.6)
        ->click('[data-dept="obgyn"]')
        ->wait(0.6)
        ->click('.department-panel.is-active .department-panel__action button')
        ->wait(0.8);

    // The strip only needs scrolling because the tabs overflow it.
    $page->assertScript(<<<'JS'
        (() => {
            const strip = document.querySelector('.services-tour__fs-tabs');

            return strip.scrollWidth > strip.clientWidth + 4;
        })()
        JS, true)
        ->assertScript("document.querySelector('.services-tour__fs-tabs').scrollLeft", 0);

    // Jumping to the last department pulls its tab into the visible window.
    $page->click('.tour-tab--psych')
        ->wait(1);

    $page->assertScript("document.querySelector('.tour-tab.is-active')?.classList.contains('tour-tab--psych')", true)
        ->assertScript("document.querySelector('.services-tour__fs-tabs').scrollLeft > 0", true)
        ->assertScript(<<<'JS'
            (() => {
                const strip = document.querySelector('.services-tour__fs-tabs');
                const active = strip.querySelector('.tour-tab.is-active');
                const s = strip.getBoundingClientRect();
                const a = active.getBoundingClientRect();

                return a.left >= s.left - 2 && a.right <= s.right + 2;
            })()
            JS, true)
        ->assertNoJavaScriptErrors();
});

it('does not arm the tour push for a department that has no page yet', function () {
    $page = visit('/services')->resize(1440, 1000);

    $page->click('.department-tab--diet');
    $page->script(<<<'JS'
        (() => {
            const root = document.querySelector('.services-tour');
            const endY = Math.max(0, root.offsetTop + root.offsetHeight - window.innerHeight);
            window.scrollTo(0, endY);
        })()
        JS);
    $page->wait(0.3);

    $page->assertScript("document.querySelector('.services-tour__hint').classList.contains('is-soon')", true);

    $page->script("for (let i = 0; i < 5; i++) { window.dispatchEvent(new WheelEvent('wheel', {deltaY: 120, cancelable: true})); }");
    $page->wait(0.5);

    $page->assertScript("document.querySelectorAll('.services-tour__frame').length", 0)
        ->assertScript("document.querySelector('.department-panel.is-active .department-panel__push > span').style.transform", 'scaleX(0)')
        ->assertNoJavaScriptErrors();
});

it('opens the booking modal when a tour frame posts a booking request', function () {
    $page = visit('/services')->resize(1440, 1000);

    $page->script(<<<'JS'
        window.postMessage({
            type: 'tour:book',
            doctor: {
                id: 77,
                name: 'Dr. Modal Test',
                name_ar: 'د. اختبار المودال',
                has_online_booking: true,
                department: {
                    name: 'Pediatrics',
                    name_ar: 'الأطفال',
                },
            },
        }, '*')
        JS);

    $page->wait(0.4)
        ->assertSee('Dr. Modal Test')
        ->assertSee('Select a date')
        ->assertNoJavaScriptErrors();
});
