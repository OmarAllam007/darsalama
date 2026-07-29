import { Form } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, LoaderCircle, Phone, X } from 'lucide-react';
import CallbackRequestController from '@/actions/App/Http/Controllers/CallbackRequestController';
import InputError from '@/components/input-error';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WhatsAppIcon from '@/site/components/WhatsAppIcon';
import {
    EMERGENCY_PHONE,
    EMERGENCY_TEL,
    MAP_EMBED_SRC,
    MAP_URL,
    WHATSAPP_LINK,
} from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';
import { saudiPhoneInputProps } from '@/site/saudiPhoneInput';

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    department: {
        name: string;
        name_ar: string;
    };
};

export default function CallbackModal({
    doctor,
    open,
    onOpenChange,
    packageOptions,
    showPackageSelector,
}: {
    doctor: Doctor | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    packageOptions: string[];
    showPackageSelector: boolean;
}) {
    const { t, lang } = useLanguage();
    const SubmitArrow = lang === 'ar' ? ArrowLeft : ArrowRight;
    const doctorName = lang === 'ar' ? doctor?.name_ar : doctor?.name;
    const departmentName =
        lang === 'ar' ? doctor?.department.name_ar : doctor?.department.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[94vh] w-[calc(100vw-1.5rem)] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-6xl [&>button:last-child]:hidden">
                {doctor && (
                    <div
                        className="dsm callback-modal"
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    >
                        <button
                            type="button"
                            className="callback-modal__close"
                            onClick={() => onOpenChange(false)}
                        >
                            <X size={16} />
                        </button>

                        <Form
                            {...CallbackRequestController.store.form(doctor.id)}
                            resetOnSuccess
                            className="callback-modal__form"
                        >
                            {({ processing, errors, wasSuccessful }) =>
                                wasSuccessful ? (
                                    <div className="callback-modal__success">
                                        <span className="callback-modal__success-icon">
                                            ✓
                                        </span>
                                        <h3>{t('callback.successTitle')}</h3>
                                        <p>{t('callback.successBody')}</p>
                                        <button
                                            type="button"
                                            className="btn btn--ink"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            {t('callback.close')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="callback-modal__head">
                                            <div>
                                                <span className="callback-modal__kicker">
                                                    <Phone size={13} />
                                                    {t('callback.formSubtitle')}
                                                </span>
                                                <h3>
                                                    {t('callback.formTitle')}
                                                </h3>
                                            </div>

                                            <div className="callback-modal__doctor">
                                                <span aria-hidden="true">
                                                    {doctorName?.charAt(0)}
                                                </span>
                                                <div>
                                                    <strong>
                                                        {doctorName}
                                                    </strong>
                                                    <small>
                                                        {departmentName}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {Object.keys(errors).length > 0 && (
                                            <p
                                                className="callback-modal__error"
                                                role="alert"
                                            >
                                                {t('booking.callbackError')}
                                            </p>
                                        )}

                                        <div className="callback-modal__row">
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-name">
                                                    {t('callback.nameLabel')}
                                                </label>
                                                <input
                                                    id="cb-name"
                                                    name="name"
                                                    required
                                                    autoComplete="name"
                                                    aria-invalid={
                                                        errors.name
                                                            ? true
                                                            : undefined
                                                    }
                                                    placeholder={t(
                                                        'callback.namePlaceholder',
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-phone">
                                                    {t('callback.phoneLabel')}
                                                </label>
                                                <div className="callback-modal__phone">
                                                    <span>+966</span>
                                                    <input
                                                        id="cb-phone"
                                                        name="phone"
                                                        aria-invalid={
                                                            errors.phone
                                                                ? true
                                                                : undefined
                                                        }
                                                        {...saudiPhoneInputProps}
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.phone}
                                                />
                                            </div>
                                        </div>

                                        {showPackageSelector && (
                                            <div className="callback-modal__field callback-modal__field--package">
                                                <label htmlFor="cb-package">
                                                    {t('callback.packageLabel')}
                                                </label>
                                                <select
                                                    id="cb-package"
                                                    name="package_of_interest"
                                                    defaultValue=""
                                                >
                                                    <option value="">
                                                        {t(
                                                            'callback.packagePlaceholder',
                                                        )}
                                                    </option>
                                                    {packageOptions.map(
                                                        (label) => (
                                                            <option
                                                                key={label}
                                                                value={label}
                                                            >
                                                                {label}
                                                            </option>
                                                        ),
                                                    )}
                                                    <option
                                                        value={t(
                                                            'obgyn.callback.notSure',
                                                        )}
                                                    >
                                                        {t(
                                                            'obgyn.callback.notSure',
                                                        )}
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.package_of_interest
                                                    }
                                                />
                                            </div>
                                        )}

                                        <div className="callback-modal__row">
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-best-time">
                                                    {t(
                                                        'callback.bestTimeLabel',
                                                    )}
                                                </label>
                                                <select
                                                    id="cb-best-time"
                                                    name="best_time"
                                                    defaultValue={t(
                                                        'callback.morning',
                                                    )}
                                                >
                                                    <option
                                                        value={t(
                                                            'callback.morning',
                                                        )}
                                                    >
                                                        {t('callback.morning')}
                                                    </option>
                                                    <option
                                                        value={t(
                                                            'callback.afternoon',
                                                        )}
                                                    >
                                                        {t(
                                                            'callback.afternoon',
                                                        )}
                                                    </option>
                                                    <option
                                                        value={t(
                                                            'callback.evening',
                                                        )}
                                                    >
                                                        {t('callback.evening')}
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={errors.best_time}
                                                />
                                            </div>
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-contact">
                                                    {t(
                                                        'callback.preferredContactLabel',
                                                    )}
                                                </label>
                                                <select
                                                    id="cb-contact"
                                                    name="preferred_contact"
                                                    defaultValue="phone"
                                                >
                                                    <option value="phone">
                                                        {t(
                                                            'callback.contactPhone',
                                                        )}
                                                    </option>
                                                    <option value="whatsapp">
                                                        {t(
                                                            'callback.contactWhatsapp',
                                                        )}
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.preferred_contact
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="callback-modal__field">
                                            <label htmlFor="cb-notes">
                                                {t('callback.notesLabel')}
                                            </label>
                                            <textarea
                                                id="cb-notes"
                                                name="notes"
                                                rows={3}
                                                placeholder={t(
                                                    'callback.notesPlaceholder',
                                                )}
                                            />
                                            <InputError
                                                message={errors.notes}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn--ink callback-modal__submit"
                                            disabled={processing}
                                            aria-busy={processing}
                                            aria-live="polite"
                                        >
                                            {processing ? (
                                                <LoaderCircle
                                                    className="callback-modal__spinner motion-safe:animate-spin"
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <SubmitArrow
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span>
                                                {processing
                                                    ? t('callback.sending')
                                                    : t('callback.submit')}
                                            </span>
                                        </button>

                                        <p className="callback-modal__consent">
                                            {t('callback.consent')}
                                        </p>
                                    </>
                                )
                            }
                        </Form>

                        <div className="callback-modal__aside">
                            <h3>{t('callback.asideTitle')}</h3>
                            <p>{t('callback.asideIntro')}</p>

                            <a
                                href={EMERGENCY_TEL}
                                className="callback-modal__aside-card"
                            >
                                <span>
                                    <small>
                                        {t('callback.inquiriesLabel')}
                                    </small>
                                    <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                                </span>
                                <i>
                                    <Phone size={16} />
                                </i>
                            </a>

                            <a
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="callback-modal__aside-card"
                            >
                                <span>
                                    <small>{t('callback.whatsappLabel')}</small>
                                    <strong>{t('callback.whatsappCta')}</strong>
                                </span>
                                <i className="callback-modal__whatsapp-icon">
                                    <WhatsAppIcon size={16} />
                                </i>
                            </a>

                            <a
                                href={MAP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="callback-modal__map"
                            >
                                <span className="callback-modal__map-badge">
                                    {t('callback.openInMaps')}
                                </span>
                                <iframe
                                    src={MAP_EMBED_SRC}
                                    loading="lazy"
                                    title="map"
                                    tabIndex={-1}
                                />
                            </a>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
