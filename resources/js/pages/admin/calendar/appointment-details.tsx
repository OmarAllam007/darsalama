import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type AppointmentEvent = {
    title: string;
    start: Date | null;
    end: Date | null;
    reference: string;
    status: string;
    email: string | null;
    phone: string | null;
    note: string | null;
    createdBy: string | null;
};

const time = (value: Date | null) =>
    value?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ??
    '—';

export function AppointmentDetails({
    appointment,
    doctorName,
    departmentName,
    onClose,
}: {
    appointment: AppointmentEvent | null;
    doctorName: string;
    departmentName: string;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={appointment !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="sm:max-w-md">
                {appointment && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{appointment.title}</DialogTitle>
                            <DialogDescription>
                                {appointment.reference} · {appointment.status}
                            </DialogDescription>
                        </DialogHeader>

                        <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <Row label="Doctor" value={doctorName} />
                            <Row label="Department" value={departmentName} />
                            <Row
                                label="Date"
                                value={
                                    appointment.start?.toLocaleDateString() ??
                                    '—'
                                }
                            />
                            <Row
                                label="Time"
                                value={`${time(appointment.start)} – ${time(appointment.end)}`}
                            />
                            <Row label="Phone" value={appointment.phone} />
                            <Row label="Email" value={appointment.email} />
                            <Row label="Note" value={appointment.note} />
                            <Row
                                label="Booked by"
                                value={appointment.createdBy}
                            />
                        </dl>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Row({ label, value }: { label: string; value: string | null }) {
    return (
        <>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="col-span-2 break-words">{value || '—'}</dd>
        </>
    );
}
