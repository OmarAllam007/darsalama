import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import ContactMessageController from '@/actions/App/Http/Controllers/ContactMessageController';
import { store as storeFeedback } from '@/actions/App/Http/Controllers/FeedbackController';
import InputError from '@/components/input-error';
import bannerPhoto from '@/site/assets/slider/slider1.jpg';
import PageBanner from '@/site/components/PageBanner';
import Pearls from '@/site/components/Pearls';
import {
    PHONE,
    PHONE_TEL,
    EMERGENCY_PHONE,
    EMERGENCY_TEL,
} from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';
import { saudiPhoneInputProps } from '@/site/saudiPhoneInput';

const MAP_DESTINATION = '26.2827618,50.2127421';
const MAP_SRC = `https://www.google.com/maps?q=${MAP_DESTINATION}&output=embed`;
// Opens turn-by-turn navigation to the hospital in the Google Maps app / site.
const MAP_NAV_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_DESTINATION}`;

const RATINGS = [
    { key: 'terrible', emoji: '😡', tone: '#ea4335' },
    { key: 'bad', emoji: '🙁', tone: '#f97316' },
    { key: 'okay', emoji: '😐', tone: '#eab308' },
    { key: 'good', emoji: '🙂', tone: '#22c55e' },
    { key: 'excellent', emoji: '😄', tone: '#3b82f6' },
];

const PIN_ICON = (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
    >
        <path d="M12 21s7-6.4 7-11.5a7 7 0 1 0-14 0C5 14.6 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.4" />
    </svg>
);

const PHONE_ICON = (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
    >
        <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2.9c0-.5.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
);

const MAIL_ICON = (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
    >
        <rect x="3" y="5" width="18" height="14" rx="2.4" />
        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CLOCK_ICON = (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ALERT_ICON = (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);

const POSITIVE_RATINGS = ['good', 'excellent'];
const REVIEW_REDIRECT_DELAY_MS = 2500;

export default function Contact({
    googleReviewUrl,
}: {
    googleReviewUrl?: string;
}) {
    const { t } = useLanguage();
    const [sent, setSent] = useState(false);
    const [rating, setRating] = useState<string | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackFailed, setFeedbackFailed] = useState(false);
    const [redirectingToReview, setRedirectingToReview] = useState(false);
    const messageForm = useForm(ContactMessageController(), {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const ratingLabels = t('feedback.ratings');
    const mobileRequired = rating === 'terrible' || rating === 'bad';

    function handleMessageSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        messageForm.submit({
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                messageForm.reset();
            },
        });
    }

    function handleFeedbackSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!rating) {
            return;
        }

        const data = Object.fromEntries(new FormData(e.currentTarget));

        router.post(
            storeFeedback.url(),
            { rating, mobile: data.mobile ?? '', notes: data.notes ?? '' },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => {
                    setFeedbackSubmitting(true);
                    setFeedbackFailed(false);
                },
                onFinish: () => setFeedbackSubmitting(false),
                onError: () => setFeedbackFailed(true),
                onSuccess: () => {
                    setFeedbackSent(true);

                    if (googleReviewUrl && POSITIVE_RATINGS.includes(rating)) {
                        setRedirectingToReview(true);
                        window.setTimeout(() => {
                            window.location.href = googleReviewUrl;
                        }, REVIEW_REDIRECT_DELAY_MS);
                    }
                },
            },
        );
    }

    return (
        <>
            <Head title={t('contact.title')} />

            <PageBanner
                eyebrow={t('contact.eyebrow')}
                title={t('contact.title')}
                intro={t('contact.intro')}
                image={bannerPhoto}
            />

            {/* Feedback experience — mirrors the "How was your experience today?" block on the reference site. */}
            <section className="contact-feedback">
                <div className="container">
                    <div className="contact-feedback__card">
                        <div
                            className="contact-feedback__signal"
                            aria-hidden="true"
                        >
                            <span />
                            <span />
                            <span />
                        </div>
                        <div className="section-intro">
                            <p className="eyebrow">
                                <Pearls /> {t('feedback.eyebrow')}
                            </p>
                            <h2>{t('feedback.title')}</h2>
                            <p>{t('feedback.intro')}</p>
                        </div>

                        {feedbackSent ? (
                            <div className="contact-feedback__thanks">
                                <h3>{t('feedback.thanksHeading')}</h3>
                                <p>{t('feedback.thanksBody')}</p>
                                {redirectingToReview && googleReviewUrl && (
                                    <>
                                        <p className="contact-feedback__redirect">
                                            {t('feedback.redirectNote')}
                                        </p>
                                        <a
                                            className="btn btn--coral"
                                            href={googleReviewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t('feedback.googleReviewCta')}
                                        </a>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="feedback-controls">
                                <div
                                    className="rating-picker"
                                    role="group"
                                    aria-label={t('feedback.title')}
                                >
                                    {RATINGS.map((r, ratingIndex) => (
                                        <button
                                            key={r.key}
                                            type="button"
                                            style={
                                                {
                                                    '--rating-tone': r.tone,
                                                    '--rating-index':
                                                        ratingIndex,
                                                } as CSSProperties
                                            }
                                            className={`rating-card${rating === r.key ? 'is-selected' : ''}`}
                                            onClick={() => setRating(r.key)}
                                            aria-pressed={rating === r.key}
                                        >
                                            <span className="rating-card__emoji">
                                                {r.emoji}
                                            </span>
                                            <span className="rating-card__label">
                                                {ratingLabels[r.key]}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {rating && (
                                    <form
                                        className="feedback-form"
                                        onSubmit={handleFeedbackSubmit}
                                    >
                                        {feedbackFailed && (
                                            <p
                                                className="feedback-form__error"
                                                role="alert"
                                            >
                                                {t('feedback.errorBody')}
                                            </p>
                                        )}
                                        <label
                                            className="feedback-form__label"
                                            htmlFor="fb-mobile"
                                        >
                                            {t('feedback.mobileLabel')}{' '}
                                            <span className="feedback-form__hint">
                                                {mobileRequired
                                                    ? t(
                                                          'feedback.mobileRequiredNote',
                                                      )
                                                    : `(${t('feedback.mobileOptional')})`}
                                            </span>
                                        </label>
                                        <div className="feedback-form__phone">
                                            <span className="feedback-form__code">
                                                +966
                                            </span>
                                            <input
                                                id="fb-mobile"
                                                name="mobile"
                                                {...saudiPhoneInputProps}
                                                placeholder={t(
                                                    'feedback.mobilePlaceholder',
                                                )}
                                                required={mobileRequired}
                                            />
                                        </div>

                                        <label
                                            className="feedback-form__label"
                                            htmlFor="fb-notes"
                                        >
                                            {t('feedback.improveLabel')}
                                        </label>
                                        <textarea
                                            id="fb-notes"
                                            name="notes"
                                            rows={5}
                                            placeholder={t(
                                                'feedback.improvePlaceholder',
                                            )}
                                        />

                                        <button
                                            type="submit"
                                            className="contact-form__submit"
                                            disabled={feedbackSubmitting}
                                        >
                                            {t('feedback.submit')}
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.4"
                                                width="15"
                                                height="15"
                                            >
                                                <path d="M5 12h14M13 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="contact-body">
                <div className="container">
                    <div className="contact-connect__shell">
                        <aside className="contact-connect__aside">
                            <div
                                className="contact-connect__orbit"
                                aria-hidden="true"
                            >
                                <span />
                                <span />
                            </div>
                            <div className="contact-connect__intro">
                                <p className="contact-connect__eyebrow">
                                    <span /> {t('contact.connectEyebrow')}
                                </p>
                                <h2>{t('contact.connectHeading')}</h2>
                                <p>{t('contact.connectBody')}</p>
                            </div>

                            <div className="contact-info__grid">
                                <a
                                    className="info-tile info-tile--phone"
                                    href={PHONE_TEL}
                                    aria-label={`${t('contact.phoneLabel')}: ${PHONE}`}
                                >
                                    <span className="info-tile__icon">
                                        {PHONE_ICON}
                                    </span>
                                    <h3>{t('contact.phoneLabel')}</h3>
                                    <p>
                                        <bdi dir="ltr">{PHONE}</bdi>
                                    </p>
                                </a>
                                <div className="info-tile">
                                    <span className="info-tile__icon">
                                        {MAIL_ICON}
                                    </span>
                                    <h3>{t('contact.mailLabel')}</h3>
                                    <p>
                                        <a
                                            href={`mailto:${t('contact.mailValue')}`}
                                        >
                                            <bdi dir="ltr">
                                                {t('contact.mailValue')}
                                            </bdi>
                                        </a>
                                    </p>
                                </div>
                                <div className="info-tile">
                                    <span className="info-tile__icon">
                                        {CLOCK_ICON}
                                    </span>
                                    <h3>{t('contact.hoursLabel')}</h3>
                                    <div className="info-tile__hours-all">
                                        <span>
                                            {t('contact.hoursAllServicesLabel')}
                                        </span>
                                        <bdi dir="ltr">24/7</bdi>
                                    </div>
                                </div>
                            </div>

                            <a
                                className="contact-connect__urgent"
                                href={EMERGENCY_TEL}
                            >
                                <span className="contact-connect__urgent-dot" />
                                <span>
                                    <small>
                                        {t('contact.emergencyLabel')} ·{' '}
                                        {t('contact.hoursEmergencyValue')}
                                    </small>
                                    <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                                </span>
                                {PHONE_ICON}
                            </a>
                        </aside>

                        <div className="contact-form-card">
                            {sent ? (
                                <div className="contact-form__sent">
                                    <span className="contact-form__check">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="30"
                                            height="30"
                                            fill="currentColor"
                                        >
                                            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                                        </svg>
                                    </span>
                                    <h2>{t('contact.form.sentHeading')}</h2>
                                    <p>{t('contact.form.sentBody')}</p>
                                </div>
                            ) : (
                                <>
                                    <h2>{t('contact.form.heading')}</h2>
                                    <p className="contact-form-card__sub">
                                        {t('contact.form.sub')}
                                    </p>
                                    <form
                                        className="contact-form"
                                        onSubmit={handleMessageSubmit}
                                    >
                                        <div className="contact-form__grid">
                                            <div className="contact-form__field">
                                                <label htmlFor="cf-name">
                                                    {t('contact.form.name')} *
                                                </label>
                                                <input
                                                    id="cf-name"
                                                    name="name"
                                                    value={
                                                        messageForm.data.name
                                                    }
                                                    onChange={(event) =>
                                                        messageForm.setData(
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    minLength={2}
                                                    placeholder="Jane Doe"
                                                />
                                                <InputError
                                                    message={
                                                        messageForm.errors.name
                                                    }
                                                />
                                            </div>
                                            <div className="contact-form__field">
                                                <label htmlFor="cf-email">
                                                    {t('contact.form.email')} *
                                                </label>
                                                <input
                                                    id="cf-email"
                                                    name="email"
                                                    type="email"
                                                    value={
                                                        messageForm.data.email
                                                    }
                                                    onChange={(event) =>
                                                        messageForm.setData(
                                                            'email',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder="name@example.com"
                                                />
                                                <InputError
                                                    message={
                                                        messageForm.errors.email
                                                    }
                                                />
                                            </div>
                                            <div className="contact-form__field">
                                                <label htmlFor="cf-phone">
                                                    {t('contact.form.phone')} *
                                                </label>
                                                <div className="contact-form__phone">
                                                    <span className="cc">
                                                        +966
                                                    </span>
                                                    <input
                                                        id="cf-phone"
                                                        name="phone"
                                                        {...saudiPhoneInputProps}
                                                        value={
                                                            messageForm.data
                                                                .phone
                                                        }
                                                        onChange={(event) =>
                                                            messageForm.setData(
                                                                'phone',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        messageForm.errors.phone
                                                    }
                                                />
                                            </div>
                                            <div className="contact-form__field">
                                                <label htmlFor="cf-subject">
                                                    {t('contact.form.subject')}{' '}
                                                    *
                                                </label>
                                                <input
                                                    id="cf-subject"
                                                    name="subject"
                                                    value={
                                                        messageForm.data.subject
                                                    }
                                                    onChange={(event) =>
                                                        messageForm.setData(
                                                            'subject',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder={t(
                                                        'contact.form.subject',
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        messageForm.errors
                                                            .subject
                                                    }
                                                />
                                            </div>
                                            <div className="contact-form__field is-full">
                                                <label htmlFor="cf-message">
                                                    {t('contact.form.message')}{' '}
                                                    *
                                                </label>
                                                <textarea
                                                    id="cf-message"
                                                    name="message"
                                                    value={
                                                        messageForm.data.message
                                                    }
                                                    onChange={(event) =>
                                                        messageForm.setData(
                                                            'message',
                                                            event.target.value,
                                                        )
                                                    }
                                                    rows={5}
                                                    required
                                                    placeholder={t(
                                                        'contact.form.message',
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        messageForm.errors
                                                            .message
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="contact-form__foot">
                                            <p className="contact-form__consent">
                                                {t('contact.form.consent')}
                                            </p>
                                            <button
                                                type="submit"
                                                className="contact-form__submit"
                                                disabled={
                                                    messageForm.processing
                                                }
                                            >
                                                {messageForm.processing
                                                    ? t('contact.form.sending')
                                                    : t('contact.form.submit')}
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.4"
                                                    width="15"
                                                    height="15"
                                                >
                                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="emergency-banner">
                <div className="container">
                    <div className="emergency-banner__card">
                        <span className="emergency-banner__icon">
                            {ALERT_ICON}
                        </span>
                        <div className="emergency-banner__text">
                            <span className="emergency-banner__badge">
                                <span className="dot" />
                                {t('contact.hoursEmergencyLabel')} ·{' '}
                                {t('contact.hoursEmergencyValue')}
                            </span>
                            <h3>{t('contact.emergencyLabel')}</h3>
                            <p>{t('contact.emergencyNote')}</p>
                        </div>
                        <a
                            className="emergency-banner__cta"
                            href={EMERGENCY_TEL}
                        >
                            {PHONE_ICON}
                            <span>
                                <small>{t('contact.phoneLabel')}</small>
                                <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            <section className="contact-map">
                <div className="container">
                    <a
                        className="contact-map__link"
                        href={MAP_NAV_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('contact.getDirections')}
                    >
                        <iframe
                            src={MAP_SRC}
                            title="Dar As Salama Medical Hospital location"
                            loading="lazy"
                            tabIndex={-1}
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <span className="contact-map__overlay">
                            <span className="contact-map__cta">
                                {PIN_ICON}
                                {t('contact.getDirections')}
                            </span>
                        </span>
                    </a>
                </div>
            </section>
        </>
    );
}
