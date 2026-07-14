import { Gift, Maximize2, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WhatsAppIcon from '@/site/components/WhatsAppIcon';
import { EMERGENCY_TEL, WHATSAPP_LINK } from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Offer = {
    id: number | string;
    title: string;
    subtitle?: string | null;
    description: string;
    image: string | null;
    price?: string | null;
    original_price?: string | null;
    is_expired?: boolean;
};

export default function OffersModal({
    doctorName,
    offers,
    open,
    onOpenChange,
}: {
    doctorName: string | null;
    offers: Offer[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t, lang } = useLanguage();
    const [lightbox, setLightbox] = useState<string | null>(null);

    const whatsappHref = (title: string) =>
        `${WHATSAPP_LINK}?text=${encodeURIComponent(
            lang === 'ar'
                ? `مرحباً، أرغب بالحجز مع ${doctorName ?? ''} - ${title}`
                : `Hi, I'd like to book with ${doctorName ?? ''} - ${title}`,
        )}`;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl [&>button:last-child]:hidden">
                    <div
                        className="dsm modal"
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        style={{ maxHeight: '90vh' }}
                    >
                        <div className="modal-head">
                            <div>
                                <div className="mh-doc">{doctorName}</div>
                                <div className="mh-sub">
                                    {t('doctors.offersSubtitle')}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => onOpenChange(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {offers.length === 0 ? (
                                <div className="no-offers">
                                    <Gift size={34} strokeWidth={1.5} />
                                    <p>{t('doctors.noOffers')}</p>
                                </div>
                            ) : (
                                offers.map((offer) =>
                                    offer.image ? (
                                        <div
                                            className="offer-poster"
                                            key={offer.id}
                                        >
                                            <img
                                                className="op-thumb"
                                                src={`/storage/${offer.image}`}
                                                alt={offer.title}
                                                onClick={() =>
                                                    setLightbox(
                                                        `/storage/${offer.image}`,
                                                    )
                                                }
                                            />
                                            <div className="op-bar">
                                                <span className="op-label">
                                                    {offer.title}
                                                </span>
                                                <div className="op-actions">
                                                    <a
                                                        className="op-act wa"
                                                        href={whatsappHref(
                                                            offer.title,
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <WhatsAppIcon
                                                            size={16}
                                                        />
                                                    </a>
                                                    <a
                                                        className="op-act tel"
                                                        href={EMERGENCY_TEL}
                                                    >
                                                        <Phone size={16} />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="op-act op-view"
                                                        onClick={() =>
                                                            setLightbox(
                                                                `/storage/${offer.image}`,
                                                            )
                                                        }
                                                    >
                                                        <Maximize2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="offer-card"
                                            key={offer.id}
                                        >
                                            <div className="offer-title">
                                                {offer.title}
                                            </div>
                                            {offer.subtitle && (
                                                <p
                                                    style={{
                                                        fontSize: 12.5,
                                                        color: 'var(--slate)',
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    {offer.subtitle}
                                                </p>
                                            )}
                                            <div className="offer-desc">
                                                {offer.description}
                                            </div>
                                            <div className="offer-foot">
                                                {(() => {
                                                    const shownPrice =
                                                        offer.is_expired
                                                            ? offer.original_price
                                                            : offer.price;
                                                    const original =
                                                        !offer.is_expired &&
                                                        offer.original_price &&
                                                        offer.original_price !==
                                                            offer.price
                                                            ? offer.original_price
                                                            : null;

                                                    return shownPrice ? (
                                                        <span className="offer-price-badge">
                                                            {original && (
                                                                <span className="offer-price-original">
                                                                    {original}{' '}
                                                                    {t(
                                                                        'doctorProfile.sar',
                                                                    )}
                                                                </span>
                                                            )}
                                                            {shownPrice}{' '}
                                                            {t(
                                                                'doctorProfile.sar',
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    );
                                                })()}
                                                <a
                                                    className="offer-book"
                                                    href={whatsappHref(
                                                        offer.title,
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <WhatsAppIcon size={14} />
                                                    {t(
                                                        'doctorProfile.bookViaWhatsapp',
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {lightbox && (
                <div
                    className="offer-lightbox active"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        type="button"
                        className="olb-x"
                        aria-label="Close"
                        onClick={() => setLightbox(null)}
                    >
                        &times;
                    </button>
                    <img src={lightbox} alt="" />
                </div>
            )}
        </>
    );
}
