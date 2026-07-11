import { Form } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RouteFormDefinition } from '@/wayfinder';

const WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

type Availability = {
    weekday: number;
    start_time: string;
    end_time: string;
    slot_minutes: number;
};

type NamePair = {
    name: string;
    name_ar: string;
};

type Department = {
    id: number;
    name: string;
};

type Nationality = {
    id: number;
    name: string;
};

type Doctor = {
    name: string;
    name_ar: string;
    job: string;
    job_ar: string;
    department_id: number;
    nationality_id: number | null;
    image: string | null;
    is_active: boolean;
    availabilities: Availability[];
    qualifications: NamePair[];
    services: NamePair[];
};

function useNameRows(initial: NamePair[]) {
    const [rows, setRows] = useState(() =>
        initial.map((row, index) => ({ id: index, ...row })),
    );
    const [nextId, setNextId] = useState(rows.length);

    const addRow = () => {
        setRows([...rows, { id: nextId, name: '', name_ar: '' }]);
        setNextId(nextId + 1);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    return { rows, addRow, removeRow };
}

function NameRowsField({
    field,
    label,
    addLabel,
    placeholder,
    rows,
    onAdd,
    onRemove,
    error,
}: {
    field: string;
    label: string;
    addLabel: string;
    placeholder?: string;
    rows: (NamePair & { id: number })[];
    onAdd: () => void;
    onRemove: (id: number) => void;
    error?: string;
}) {
    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            {rows.map((row, index) => (
                <div
                    key={row.id}
                    className="flex flex-wrap items-end gap-2 rounded-md border p-3"
                >
                    <div className="grid flex-1 gap-1">
                        <Label className="text-xs text-muted-foreground">
                            Name
                        </Label>
                        <Input
                            name={`${field}[${index}][name]`}
                            defaultValue={row.name}
                            required
                            placeholder={placeholder}
                        />
                    </div>
                    <div className="grid flex-1 gap-1">
                        <Label className="text-xs text-muted-foreground">
                            Arabic name
                        </Label>
                        <Input
                            name={`${field}[${index}][name_ar]`}
                            dir="rtl"
                            defaultValue={row.name_ar}
                            required
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onRemove(row.id)}
                    >
                        Remove
                    </Button>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={onAdd}>
                {addLabel}
            </Button>
            <InputError message={error} />
        </div>
    );
}

export default function DoctorForm({
    form,
    departments,
    nationalities,
    doctor,
    imageUrl,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    departments: Department[];
    nationalities: Nationality[];
    doctor?: Doctor;
    imageUrl?: string | null;
}) {
    const [rows, setRows] = useState(() =>
        (doctor?.availabilities.length
            ? doctor.availabilities
            : [
                  {
                      weekday: 0,
                      start_time: '09:00',
                      end_time: '17:00',
                      slot_minutes: 30,
                  },
              ]
        ).map((availability, index) => ({ id: index, ...availability })),
    );
    const [nextId, setNextId] = useState(rows.length);

    const addRow = () => {
        setRows([
            ...rows,
            {
                id: nextId,
                weekday: 0,
                start_time: '09:00',
                end_time: '17:00',
                slot_minutes: 30,
            },
        ]);
        setNextId(nextId + 1);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const qualifications = useNameRows(doctor?.qualifications ?? []);
    const services = useNameRows(doctor?.services ?? []);

    return (
        <Form
            {...form}
            encType="multipart/form-data"
            className="space-y-6"
            onSuccess={() =>
                toast.success(doctor ? 'Doctor updated.' : 'Doctor created.')
            }
            onError={() => toast.error('Please fix the errors below.')}
        >
            
            {({ processing, errors }) => (
                
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={doctor?.name}
                            required
                            autoFocus
                            placeholder="Dr. Jane Doe"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name_ar">Arabic name</Label>
                        <Input
                            id="name_ar"
                            name="name_ar"
                            dir="rtl"
                            defaultValue={doctor?.name_ar}
                            required
                        />
                        <InputError message={errors.name_ar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="job">Job title</Label>
                        <Input
                            id="job"
                            name="job"
                            defaultValue={doctor?.job}
                            required
                            placeholder="Consultant Cardiologist"
                        />
                        <InputError message={errors.job} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="job_ar">Arabic job title</Label>
                        <Input
                            id="job_ar"
                            name="job_ar"
                            dir="rtl"
                            defaultValue={doctor?.job_ar}
                            required
                        />
                        <InputError message={errors.job_ar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="department_id">Department</Label>
                        <select
                            id="department_id"
                            name="department_id"
                            defaultValue={doctor?.department_id}
                            required
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                        >
                            {departments.map((department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.department_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="nationality_id">Nationality</Label>
                        <select
                            id="nationality_id"
                            name="nationality_id"
                            defaultValue={doctor?.nationality_id ?? ''}
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                        >
                            <option value="">None</option>
                            {nationalities.map((nationality) => (
                                <option
                                    key={nationality.id}
                                    value={nationality.id}
                                >
                                    {nationality.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.nationality_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Photo</Label>
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Current"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        )}
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="hidden" name="is_active" value="0" />
                        <Checkbox
                            id="is_active"
                            name="is_active"
                            value="1"
                            defaultChecked={doctor?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">
                            Active (visible on the public site)
                        </Label>
                    </div>

                    <div className="space-y-3">
                        <Label>Weekly availability</Label>

                        {rows.map((row, index) => (
                            <div
                                key={row.id}
                                className="flex flex-wrap items-end gap-2 rounded-md border p-3"
                            >
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Day
                                    </Label>
                                    <select
                                        name={`availabilities[${index}][weekday]`}
                                        defaultValue={row.weekday}
                                        className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none"
                                    >
                                        {WEEKDAYS.map((day, weekday) => (
                                            <option
                                                key={weekday}
                                                value={weekday}
                                            >
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Start
                                    </Label>
                                    <Input
                                        type="time"
                                        name={`availabilities[${index}][start_time]`}
                                        defaultValue={row.start_time}
                                        required
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">
                                        End
                                    </Label>
                                    <Input
                                        type="time"
                                        name={`availabilities[${index}][end_time]`}
                                        defaultValue={row.end_time}
                                        required
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Slot (min)
                                    </Label>
                                    <Input
                                        type="number"
                                        min={5}
                                        max={240}
                                        name={`availabilities[${index}][slot_minutes]`}
                                        defaultValue={row.slot_minutes}
                                        className="w-20"
                                        required
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeRow(row.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addRow}
                        >
                            Add time window
                        </Button>
                        <InputError message={errors.availabilities} />
                    </div>

                    <NameRowsField
                        field="qualifications"
                        label="Qualifications"
                        addLabel="Add qualification"
                        placeholder="MBBS"
                        rows={qualifications.rows}
                        onAdd={qualifications.addRow}
                        onRemove={qualifications.removeRow}
                        error={errors.qualifications}
                    />

                    <NameRowsField
                        field="services"
                        label="Services"
                        addLabel="Add service"
                        placeholder="Root canal treatment"
                        rows={services.rows}
                        onAdd={services.addRow}
                        onRemove={services.removeRow}
                        error={errors.services}
                    />

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
