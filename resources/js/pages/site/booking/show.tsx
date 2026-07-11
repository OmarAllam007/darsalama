import { Head } from '@inertiajs/react';
import { Gift } from 'lucide-react';
import { useState } from 'react';
import BookingForm from '@/site/components/BookingForm';
import OffersModal from '@/site/components/OffersModal';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Offer = {
    id: number;
    title: string;
    description: string;
    image: string | null;
};

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    image: string | null;
    department: { name: string; name_ar: string; offers: Offer[] };
};

export default function BookingShow({
    doctor,
    availableWeekdays,
}: {
    doctor: Doctor;
    availableWeekdays: number[];
}) {
    const { t, lang } = useLanguage();
    const [offersOpen, setOffersOpen] = useState(false);
    const doctorName = lang === 'ar' ? doctor.name_ar : doctor.name;
    const offers = doctor.department.offers;

    return (
        <>
            <Head title={`${t('booking.pageTitle')} ${doctorName}`} />

            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border bg-background p-6 shadow-sm md:p-10">
                        <div className="flex items-center gap-4">
                            {doctor.image && (
                                <img
                                    src={`/storage/${doctor.image}`}
                                    alt={doctorName}
                                    className="size-16 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <h1 className="text-xl font-semibold text-primary">
                                    {doctorName}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {lang === 'ar'
                                        ? doctor.department.name_ar
                                        : doctor.department.name}
                                </p>
                            </div>
                        </div>

                        <BookingForm
                            doctorId={doctor.id}
                            availableWeekdays={availableWeekdays}
                        />

                        {offers.length > 0 && (
                            <div className="space-y-3 border-t pt-6">
                                <h2 className="text-lg font-semibold text-primary">
                                    {t('doctors.offers')}
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {offers.map((offer) => (
                                        <button
                                            type="button"
                                            key={offer.id}
                                            onClick={() => setOffersOpen(true)}
                                            className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-start transition hover:border-primary/50"
                                        >
                                            <Gift
                                                size={18}
                                                className="mt-0.5 shrink-0 text-primary"
                                            />
                                            <span>
                                                <span className="block font-medium">
                                                    {offer.title}
                                                </span>
                                                <span className="line-clamp-2 text-sm text-muted-foreground">
                                                    {offer.description}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <OffersModal
                doctorName={doctorName}
                offers={offers}
                open={offersOpen}
                onOpenChange={setOffersOpen}
            />
        </>
    );
}
