import { Gift, Phone } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EMERGENCY_PHONE, EMERGENCY_TEL } from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Offer = {
    id: number | string;
    title: string;
    subtitle?: string | null;
    description: string;
    image: string | null;
    price?: string | null;
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
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{doctorName}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {t('doctors.offersSubtitle')}
                    </p>
                </DialogHeader>

                {offers.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                        <Gift size={28} strokeWidth={1.5} />
                        <p className="text-sm">{t('doctors.noOffers')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="overflow-hidden rounded-lg border"
                            >
                                {offer.image && (
                                    <img
                                        src={`/storage/${offer.image}`}
                                        alt={offer.title}
                                        className="w-full object-cover"
                                    />
                                )}
                                <div className="space-y-2 p-4">
                                    <h3 className="font-semibold">
                                        {offer.title}
                                    </h3>
                                    {offer.subtitle && (
                                        <p className="text-sm text-muted-foreground">
                                            {offer.subtitle}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {offer.description}
                                    </p>
                                    {offer.price && (
                                        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                            {offer.price}{' '}
                                            {t('doctorProfile.sar')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <a
                    href={EMERGENCY_TEL}
                    className="flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
                >
                    <Phone size={16} />
                    {t('doctors.callUs')}
                    <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                </a>
            </DialogContent>
        </Dialog>
    );
}
