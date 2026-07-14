import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import BookingForm from '@/site/components/BookingForm';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    availabilities: { weekday: number }[];
};

export default function BookingModal({
    doctor,
    open,
    onOpenChange,
}: {
    doctor: Doctor | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t, lang } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-xl [&>button:last-child]:hidden">
                {doctor && (
                    <div
                        className="dsm bk-modal"
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    >
                        <button
                            type="button"
                            className="bk-close"
                            onClick={() => onOpenChange(false)}
                        >
                            <X size={16} />
                        </button>

                        <div className="bk-head">
                            <div className="bk-title">
                                {lang === 'ar' ? doctor.name_ar : doctor.name}
                            </div>
                            <div className="bk-doc">
                                {t('booking.pageTitle')}
                            </div>
                        </div>

                        <div className="bk-body">
                            <BookingForm
                                doctorId={doctor.id}
                                availableWeekdays={[
                                    ...new Set(
                                        doctor.availabilities.map(
                                            (a) => a.weekday,
                                        ),
                                    ),
                                ]}
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
