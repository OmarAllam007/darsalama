import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    index as appointmentsIndex,
    slots as slotsRoute,
    store,
} from '@/actions/App/Http/Controllers/Admin/AppointmentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Doctor = {
    id: number;
    name: string;
    department: { name: string; slot_minutes: number } | null;
};

export default function CreateAppointment({ doctors }: { doctors: Doctor[] }) {
    const [doctorId, setDoctorId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const loadSlots = (nextDoctorId: string, nextDate: string) => {
        setTime('');

        if (!nextDoctorId || !nextDate) {
            setSlots([]);

            return;
        }

        setLoadingSlots(true);

        fetch(
            slotsRoute(Number(nextDoctorId), { query: { date: nextDate } }).url,
            { headers: { Accept: 'application/json' } },
        )
            .then((res) => res.json())
            .then((data) => setSlots(data.slots ?? []))
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const form = new FormData(event.target as HTMLFormElement);

        setProcessing(true);
        router.post(
            store().url,
            {
                doctor_id: doctorId,
                date,
                time,
                first_name: form.get('first_name'),
                last_name: form.get('last_name'),
                email: form.get('email'),
                phone: form.get('phone'),
            },
            {
                onError: (e) => {
                    setErrors(e);
                    toast.error('Please fix the errors below.');
                },
                onSuccess: () => toast.success('Appointment booked.'),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Book appointment" />

            <form onSubmit={submit} className="max-w-lg space-y-6 p-4">
                <Heading title="Book appointment" />

                <div className="grid gap-2">
                    <Label htmlFor="doctor_id">Doctor</Label>
                    <select
                        id="doctor_id"
                        value={doctorId}
                        onChange={(e) => {
                            setDoctorId(e.target.value);
                            loadSlots(e.target.value, date);
                        }}
                        required
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="">Select a doctor…</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                                {doctor.department
                                    ? ` — ${doctor.department.name} (${doctor.department.slot_minutes} min)`
                                    : ''}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.doctor_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            loadSlots(doctorId, e.target.value);
                        }}
                        required
                    />
                    <InputError message={errors.date} />
                </div>

                <div className="grid gap-2">
                    <Label>Time slot</Label>
                    {!doctorId || !date ? (
                        <p className="text-sm text-muted-foreground">
                            Pick a doctor and date to see open slots.
                        </p>
                    ) : loadingSlots ? (
                        <p className="text-sm text-muted-foreground">
                            Loading slots…
                        </p>
                    ) : slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No open slots that day (off, vacation, OR, or fully
                            booked).
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setTime(slot)}
                                    className={`rounded-md border px-3 py-1 text-sm ${
                                        time === slot
                                            ? 'bg-primary text-primary-foreground'
                                            : ''
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                    <InputError message={errors.time} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input id="first_name" name="first_name" required />
                        <InputError message={errors.first_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input id="last_name" name="last_name" required />
                        <InputError message={errors.last_name} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" />
                        <InputError message={errors.phone} />
                    </div>
                </div>

                <Button disabled={processing || !time}>Book appointment</Button>
            </form>
        </>
    );
}

CreateAppointment.layout = {
    breadcrumbs: [
        { title: 'Appointments', href: appointmentsIndex() },
        { title: 'Book', href: '#' },
    ] satisfies BreadcrumbItem[],
};
