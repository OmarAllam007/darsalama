import { PHONE_TEL, WHATSAPP_LINK } from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';

const WHATSAPP_TEXT = encodeURIComponent(
    "Hello Dar As Salama, I'd like to inquire about a department",
);

export default function FloatActions() {
    const { t } = useLanguage();

    return (
        <div className="dsm float-actions">
            <a
                className="fab wa"
                href={`${WHATSAPP_LINK}?text=${WHATSAPP_TEXT}`}
                target="_blank"
                rel="noopener noreferrer"
                data-label={t('floatActions.whatsapp')}
                aria-label={t('floatActions.whatsapp')}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-.9 1.1-.3.2-.6.1c-.9-.4-1.8-1-2.5-1.7-.7-.7-1.3-1.5-1.8-2.4-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.2-.5 0-.2 0-.3-.1-.4l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.1 3 2 3 4.8 4.2c1.8.7 2.5.8 3.4.6.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4M12 22h-.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.9 4.8-10.7 10.7-10.7 2.9 0 5.5 1.1 7.6 3.1 2 2 3.1 4.7 3.1 7.6 0 5.9-4.8 10.7-10.6 10.7M20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.4" />
                </svg>
            </a>
            <a
                className="fab tel"
                href={PHONE_TEL}
                data-label={t('floatActions.call')}
                aria-label={t('floatActions.call')}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.3-.6-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                </svg>
            </a>
        </div>
    );
}
