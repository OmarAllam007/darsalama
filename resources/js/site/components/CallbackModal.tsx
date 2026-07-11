import { Form } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Phone, X } from 'lucide-react';
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

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
};

export default function CallbackModal({
    doctor,
    open,
    onOpenChange,
    packageOptions,
}: {
    doctor: Doctor | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    packageOptions: string[];
}) {
    const { t, lang } = useLanguage();
    const SubmitArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-4xl [&>button:last-child]:hidden">
                {doctor && (
                    <div className="callback-modal">
                        <button
                            type="button"
                            className="callback-modal__close"
                            onClick={() => onOpenChange(false)}
                        >
                            <X size={16} />
                        </button>

                        <Form
                            {...CallbackRequestController.store.form(
                                doctor.id,
                            )}
                            resetOnSuccess
                            className="callback-modal__form"
                        >
                            {({ processing, errors, wasSuccessful }) =>
                                wasSuccessful ? (
                                    <div className="callback-modal__success">
                                        <h3>{t('callback.successTitle')}</h3>
                                        <p>{t('callback.successBody')}</p>
                                        <button
                                            type="button"
                                            className="btn btn--ink"
                                            onClick={() =>
                                                onOpenChange(false)
                                            }
                                        >
                                            {t('callback.close')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="callback-modal__head">
                                            <h3>{t('callback.formTitle')}</h3>
                                            <p>
                                                {t('callback.formSubtitle')}
                                            </p>
                                        </div>

                                        <div className="callback-modal__row">
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-phone">
                                                    {t('callback.phoneLabel')}
                                                </label>
                                                <div className="callback-modal__phone">
                                                    <span>+966</span>
                                                    <input
                                                        id="cb-phone"
                                                        name="phone"
                                                        required
                                                        placeholder="5XXXXXXXX"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.phone}
                                                />
                                            </div>
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-name">
                                                    {t('callback.nameLabel')}
                                                </label>
                                                <input
                                                    id="cb-name"
                                                    name="name"
                                                    required
                                                    placeholder={t(
                                                        'callback.namePlaceholder',
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>
                                        </div>

                                        {packageOptions.length > 0 && (
                                            <div className="callback-modal__field">
                                                <label htmlFor="cb-package">
                                                    {t(
                                                        'callback.packageLabel',
                                                    )}
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
                                                </select>
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
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn--ink callback-modal__submit"
                                            disabled={processing}
                                        >
                                            <SubmitArrow size={16} />
                                            {t('callback.submit')}
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
                                    <small>
                                        {t('callback.whatsappLabel')}
                                    </small>
                                    <strong>
                                        {t('callback.whatsappCta')}
                                    </strong>
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
