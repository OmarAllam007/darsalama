import type { EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head } from '@inertiajs/react';
import { CalendarCheck2, Clock3, Stethoscope } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Heading from '@/components/heading';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    index as calendarIndex,
    events as eventsRoute,
} from '@/routes/admin/calendar';
import type { BreadcrumbItem } from '@/types';
import { AppointmentDetails } from './appointment-details';
import type { AppointmentEvent } from './appointment-details';
import { BookingDialog } from './booking-dialog';
import './calendar.css';

type Doctor = { id: number; name: string };
type Department = {
    id: number;
    name: string;
    slot_minutes: number;
    doctors: Doctor[];
};

export default function CalendarIndex({
    departments,
}: {
    departments: Department[];
}) {
    const [departmentId, setDepartmentId] = useState<string>(
        departments[0] ? String(departments[0].id) : '',
    );
    const [doctorId, setDoctorId] = useState<string>(
        departments[0]?.doctors[0] ? String(departments[0].doctors[0].id) : '',
    );
    const [slotMinutes, setSlotMinutes] = useState(
        departments[0]?.slot_minutes ?? 15,
    );
    const [booking, setBooking] = useState<{
        date: string;
        time: string;
    } | null>(null);
    const [viewing, setViewing] = useState<AppointmentEvent | null>(null);

    const calendar = useRef<FullCalendar>(null);

    const department = departments.find((d) => String(d.id) === departmentId);
    const doctor = department?.doctors.find((d) => String(d.id) === doctorId);

    const selectDepartment = (value: string) => {
        setDepartmentId(value);

        const next = departments.find((d) => String(d.id) === value);
        setDoctorId(next?.doctors[0] ? String(next.doctors[0].id) : '');
    };

    const fetchEvents = useCallback(
        async (info: {
            startStr: string;
            endStr: string;
        }): Promise<EventInput[]> => {
            if (!doctorId) {
                return [];
            }

            const response = await fetch(
                eventsRoute(Number(doctorId), {
                    query: { start: info.startStr, end: info.endStr },
                }).url,
                { headers: { Accept: 'application/json' } },
            );

            if (!response.ok) {
                toast.error('Could not load the calendar.');

                return [];
            }

            const payload = await response.json();
            setSlotMinutes(payload.slotMinutes);

            return payload.events;
        },
        [doctorId],
    );

    // A free slot opens the booking form on that exact time; a booked one opens
    // its details. Nothing else on the calendar is clickable.
    const openEvent = (arg: EventClickArg) => {
        const props = arg.event.extendedProps;

        if (props.kind === 'slot') {
            setBooking({ date: props.date, time: props.time });

            return;
        }

        if (props.kind === 'appointment') {
            setViewing({
                ...(props as AppointmentEvent),
                title: arg.event.title,
                start: arg.event.start,
                end: arg.event.end,
            });
        }
    };

    return (
        <>
            <Head title="Calendar" />

            <div className="space-y-5 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Reception calendar"
                        description="Book an available time or open a patient appointment from one focused doctor calendar."
                    />
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="grid gap-4 border-b border-slate-300 bg-slate-950 p-4 text-white md:grid-cols-[1fr_auto] md:items-end md:p-5 dark:border-slate-700">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                                <Stethoscope className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">
                                    Viewing appointments for
                                </p>
                                <p className="truncate text-lg font-semibold">
                                    {doctor?.name ?? 'Select a doctor'}
                                </p>
                                <p className="truncate text-sm text-slate-300">
                                    {department?.name ?? 'No department'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <Clock3 className="size-4 text-cyan-300" />
                                {slotMinutes} minute slots
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CalendarCheck2 className="size-4 text-cyan-300" />
                                Live availability
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="grid gap-1">
                            <Label>Department</Label>
                            <Select
                                value={departmentId}
                                onValueChange={selectDepartment}
                            >
                                <SelectTrigger className="w-60 bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1">
                            <Label>Doctor</Label>
                            <Select
                                value={doctorId}
                                onValueChange={setDoctorId}
                            >
                                <SelectTrigger className="w-60 bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(department?.doctors ?? []).map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Legend />

                    {doctorId ? (
                        <div className="calendar-shell overflow-x-auto p-2 sm:p-4">
                            <FullCalendar
                                ref={calendar}
                                key={doctorId}
                                plugins={[
                                    dayGridPlugin,
                                    timeGridPlugin,
                                    interactionPlugin,
                                ]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                height="auto"
                                timeZone="local"
                                firstDay={6}
                                allDaySlot={false}
                                nowIndicator
                                slotDuration={`00:${String(slotMinutes).padStart(2, '0')}:00`}
                                snapDuration={`00:${String(slotMinutes).padStart(2, '0')}:00`}
                                slotMinTime="07:00:00"
                                slotMaxTime="23:00:00"
                                slotEventOverlap={false}
                                dayMaxEvents={4}
                                stickyHeaderDates
                                eventClick={openEvent}
                                events={fetchEvents}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-72 flex-col items-center justify-center gap-2 p-8 text-center">
                            <CalendarCheck2 className="size-8 text-slate-400" />
                            <p className="font-medium text-slate-900 dark:text-white">
                                No active doctor in this department
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Choose another department to view appointments.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {booking && doctor && (
                <BookingDialog
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    date={booking.date}
                    time={booking.time}
                    onClose={() => setBooking(null)}
                    onBooked={() => {
                        setBooking(null);
                        calendar.current?.getApi().refetchEvents();
                    }}
                />
            )}

            <AppointmentDetails
                appointment={viewing}
                doctorName={doctor?.name ?? ''}
                departmentName={department?.name ?? ''}
                onClose={() => setViewing(null)}
            />
        </>
    );
}

function Legend() {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 px-4 py-3 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300">
            <LegendKey className="bg-emerald-600" label="Available" />
            <LegendKey
                className="bg-rose-600"
                label="Unavailable (reason shown)"
            />
            <LegendKey className="bg-blue-700" label="Booked appointment" />
            <span className="ml-auto text-slate-500 dark:text-slate-400">
                Select a free slot to book
            </span>
        </div>
    );
}

function LegendKey({ className, label }: { className: string; label: string }) {
    return (
        <span className="flex items-center gap-2">
            <span
                className={`inline-block size-2.5 rounded-full ${className}`}
            />
            {label}
        </span>
    );
}

CalendarIndex.layout = {
    breadcrumbs: [
        { title: 'Calendar', href: calendarIndex() },
    ] satisfies BreadcrumbItem[],
};
