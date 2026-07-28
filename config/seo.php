<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site-wide SEO Defaults
    |--------------------------------------------------------------------------
    |
    | Rendered into every page's <head> and used as the fallback whenever a page
    | does not pass its own `seo` prop. The site renders on the client, so these
    | server-rendered tags are what crawlers and link previews read first.
    |
    */

    'title' => 'Dar As Salama Medical Hospital — Al Khobar',

    'description' => 'Dar As Salama Medical Hospital in Al Khobar, Saudi Arabia. '
        .'Trusted family healthcare since 1976 — obstetrics and gynaecology, paediatrics, '
        .'general surgery, internal medicine, dental and more. Book an appointment online.',

    /*
    | Social preview card. 1200x630 keeps Facebook, LinkedIn, WhatsApp and X
    | from cropping it.
    */
    'image' => '/og-image.jpg',

    'locale' => 'en_US',

    'alternate_locales' => ['ar_SA', 'ur_PK'],

    /*
    | Brand colour used for the mobile browser chrome.
    */
    'theme_color' => '#13457a',

    /*
    |--------------------------------------------------------------------------
    | Organisation Details
    |--------------------------------------------------------------------------
    |
    | Emitted as schema.org JSON-LD so Google can show the hospital's name,
    | location, phone and hours directly in search and maps results. Keep these
    | identical to the Google Business Profile — mismatches weaken local ranking.
    |
    */

    'organisation' => [
        'name' => 'Dar As Salama Medical Hospital',
        'name_ar' => 'مستشفى دار السلامة الطبية',
        'founded' => '1976',
        'telephone' => '+966920023552',
        'street_address' => 'Al Khobar Al Shamalia',
        'locality' => 'Khobar',
        'region' => 'Eastern Province',
        'country' => 'SA',
        'latitude' => '26.2827618',
        'longitude' => '50.2127421',
        'same_as' => [
            'https://www.google.com/maps?q=Dar+AsSalama+Hospital,+Al+Khobar+Al+Shamalia,+Khobar,+Saudi+Arabia',
        ],
    ],

];
