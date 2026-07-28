import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patients as patientsRoute } from '@/routes/admin/calendar';
import { store as storeAppointment } from '@/routes/admin/calendar/appointments';

type Patient = {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
};

export function BookingDialog({
    doctorId,
    doctorName,
    date,
    time,
    onClose,
    onBooked,
}: {
    doctorId: number;
    doctorName: string;
    date: string;
    time: string;
    onClose: () => void;
    onBooked: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        date,
        time,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        note: '',
    });

    // The doctor comes from the route, so its validation error arrives on the
    // page rather than on a form field.
    const doctorError = usePage().props.errors.doctor_id;

    const [search, setSearch] = useState('');
    const [matches, setMatches] = useState<Patient[]>([]);

    // Reception mostly re-books people who have been here before; this offers
    // them without a patients table existing.
    useEffect(() => {
        if (search.trim().length < 2) {
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    patientsRoute({ query: { q: search } }).url,
                    {
                        headers: { Accept: 'application/json' },
                        signal: controller.signal,
                    },
                );

                if (response.ok) {
                    setMatches((await response.json()).patients);
                }
            } catch {
                // An aborted lookup is not worth telling anyone about.
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [search]);

    // Cleared as soon as the box is emptied, without a second state write.
    const suggestions = search.trim().length < 2 ? [] : matches;

    const applyPatient = (patient: Patient) => {
        setData((current) => ({
            ...current,
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email ?? '',
            phone: patient.phone ?? '',
        }));
        setSearch('');
        setMatches([]);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post(storeAppointment(doctorId).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Appointment booked.');
                onBooked();
            },
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New appointment</DialogTitle>
                    <DialogDescription>
                        {doctorName} · {date} at {time}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="relative grid gap-1">
                        <Label htmlFor="patient-search">
                            Find a previous patient
                        </Label>
                        <Input
                            id="patient-search"
                            value={search}
                            placeholder="Name or phone"
                            autoComplete="off"
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                                {suggestions.map((patient, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                            onClick={() =>
                                                applyPatient(patient)
                                            }
                                        >
                                            {patient.first_name}{' '}
                                            {patient.last_name}
                                            {patient.phone && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    · {patient.phone}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="first_name"
                            label="First name"
                            value={data.first_name}
                            error={errors.first_name}
                            onChange={(value) => setData('first_name', value)}
                        />
                        <Field
                            id="last_name"
                            label="Last name"
                            value={data.last_name}
                            error={errors.last_name}
                            onChange={(value) => setData('last_name', value)}
                        />
                        <Field
                            id="phone"
                            label="Phone"
                            value={data.phone}
                            error={errors.phone}
                            onChange={(value) => setData('phone', value)}
                        />
                        <Field
                            id="email"
                            label="Email"
                            type="email"
                            value={data.email}
                            error={errors.email}
                            onChange={(value) => setData('email', value)}
                        />
                    </div>

                    <Field
                        id="note"
                        label="Note"
                        value={data.note}
                        error={errors.note}
                        onChange={(value) => setData('note', value)}
                    />

                    <InputError message={errors.time ?? doctorError} />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Booking…' : 'Book appointment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    id,
    label,
    value,
    error,
    onChange,
    type = 'text',
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    type?: string;
}) {
    return (
        <div className="grid gap-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}
