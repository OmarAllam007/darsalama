import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                {doctor && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {lang === 'ar' ? doctor.name_ar : doctor.name}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                {t('booking.pageTitle')}
                            </p>
                        </DialogHeader>

                        <BookingForm
                            doctorId={doctor.id}
                            availableWeekdays={[
                                ...new Set(
                                    doctor.availabilities.map((a) => a.weekday),
                                ),
                            ]}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
