import { Form } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RouteFormDefinition } from '@/wayfinder';

type Department = {
    id: number;
    name: string;
};

type Feature = {
    is_highlighted: boolean;
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
};

type PriceTier = {
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
    amount: string;
};

type StageTest = {
    name: string;
    code: string | null;
};

type Stage = {
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    subtitle_en: string | null;
    subtitle_ar: string | null;
    free_consultations: number;
    tests: StageTest[];
};

type Package = {
    department_id: number;
    slug: string | null;
    type: 'delivery' | 'care' | 'transport';
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    category_label_en: string | null;
    category_label_ar: string | null;
    category_label_ur: string | null;
    category_label_tl: string | null;
    description_en: string | null;
    description_ar: string | null;
    description_ur: string | null;
    description_tl: string | null;
    tagline_en: string | null;
    tagline_ar: string | null;
    tagline_ur: string | null;
    tagline_tl: string | null;
    price: string | null;
    original_price: string | null;
    sort_order: number;
    is_active: boolean;
    features: Feature[];
    price_tiers: PriceTier[];
    stages: Stage[];
};

function useRows<T>(initial: T[], blank: () => T) {
    const [rows, setRows] = useState(() =>
        initial.map((row, index) => ({ key: index, value: row })),
    );
    const [nextKey, setNextKey] = useState(initial.length);

    const add = () => {
        setRows((current) => [...current, { key: nextKey, value: blank() }]);
        setNextKey((k) => k + 1);
    };
    const remove = (key: number) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    return { rows, add, remove };
}

function LangInputs({
    prefix,
    base,
    values,
    required,
}: {
    prefix: string;
    base: string;
    values: Record<string, string | null>;
    required?: boolean;
}) {
    const langs: { code: string; label: string; rtl?: boolean }[] = [
        { code: 'en', label: 'English' },
        { code: 'ar', label: 'Arabic', rtl: true },
        { code: 'ur', label: 'Urdu', rtl: true },
        { code: 'tl', label: 'Filipino' },
    ];

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {langs.map((lang) => (
                <div key={lang.code} className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                        {lang.label}
                        {required && lang.code !== 'en' && lang.code !== 'ar'
                            ? ' (optional)'
                            : ''}
                    </Label>
                    <Input
                        name={`${prefix}[${base}_${lang.code}]`}
                        dir={lang.rtl ? 'rtl' : undefined}
                        defaultValue={values[`${base}_${lang.code}`] ?? ''}
                        required={
                            required &&
                            (lang.code === 'en' || lang.code === 'ar')
                        }
                    />
                </div>
            ))}
        </div>
    );
}

export default function PackageForm({
    form,
    departments,
    pkg,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    departments: Department[];
    pkg?: Package;
}) {
    const features = useRows<Feature>(pkg?.features ?? [], () => ({
        is_highlighted: false,
        label_en: '',
        label_ar: '',
        label_ur: null,
        label_tl: null,
    }));
    const tiers = useRows<PriceTier>(pkg?.price_tiers ?? [], () => ({
        label_en: '',
        label_ar: '',
        label_ur: null,
        label_tl: null,
        amount: '',
    }));
    const stages = useRows<Stage>(pkg?.stages ?? [], () => ({
        name_en: '',
        name_ar: '',
        name_ur: null,
        name_tl: null,
        subtitle_en: null,
        subtitle_ar: null,
        free_consultations: 0,
        tests: [],
    }));

    return (
        <Form
            {...form}
            encType="multipart/form-data"
            className="space-y-8"
            onSuccess={() =>
                toast.success(pkg ? 'Package updated.' : 'Package created.')
            }
            onError={() => toast.error('Please fix the errors below.')}
        >
            {({ processing, errors }) => (
                <>
                    <section className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department_id">Department</Label>
                            <select
                                id="department_id"
                                name="department_id"
                                defaultValue={pkg?.department_id}
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

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-1">
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue={pkg?.type ?? 'delivery'}
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                                >
                                    <option value="delivery">Delivery</option>
                                    <option value="care">Care (stages)</option>
                                    <option value="transport">Transport</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="sort_order">Sort order</Label>
                                <Input
                                    id="sort_order"
                                    name="sort_order"
                                    type="number"
                                    min={0}
                                    defaultValue={pkg?.sort_order ?? 0}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <LangInputs
                                prefix=""
                                base="name"
                                values={
                                    (pkg ?? {}) as Record<string, string | null>
                                }
                                required
                            />
                            <InputError message={errors.name_en} />
                            <InputError message={errors.name_ar} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Category label</Label>
                            <LangInputs
                                prefix=""
                                base="category_label"
                                values={
                                    (pkg ?? {}) as Record<string, string | null>
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Tagline</Label>
                            <LangInputs
                                prefix=""
                                base="tagline"
                                values={
                                    (pkg ?? {}) as Record<string, string | null>
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description_en">
                                Description (English)
                            </Label>
                            <Textarea
                                id="description_en"
                                name="description_en"
                                rows={3}
                                defaultValue={pkg?.description_en ?? ''}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description_ar">
                                Description (Arabic)
                            </Label>
                            <Textarea
                                id="description_ar"
                                name="description_ar"
                                dir="rtl"
                                rows={3}
                                defaultValue={pkg?.description_ar ?? ''}
                            />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-1">
                                <Label htmlFor="price">Price (SAR)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    defaultValue={pkg?.price ?? ''}
                                />
                                <InputError message={errors.price} />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="original_price">
                                    Original price (SAR)
                                </Label>
                                <Input
                                    id="original_price"
                                    name="original_price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    defaultValue={pkg?.original_price ?? ''}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Poster image</Label>
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
                                defaultChecked={pkg?.is_active ?? true}
                            />
                            <Label htmlFor="is_active">
                                Active (visible on the public site)
                            </Label>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <Label className="text-base">Features</Label>
                        {features.rows.map(({ key, value }, index) => (
                            <div
                                key={key}
                                className="space-y-3 rounded-md border p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="hidden"
                                        name={`features[${index}][is_highlighted]`}
                                        value="0"
                                    />
                                    <Checkbox
                                        name={`features[${index}][is_highlighted]`}
                                        value="1"
                                        defaultChecked={value.is_highlighted}
                                    />
                                    <Label className="text-xs text-muted-foreground">
                                        Highlighted (gold)
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="ml-auto"
                                        onClick={() => features.remove(key)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <LangInputs
                                    prefix={`features[${index}]`}
                                    base="label"
                                    values={
                                        value as unknown as Record<
                                            string,
                                            string | null
                                        >
                                    }
                                    required
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={features.add}
                        >
                            Add feature
                        </Button>
                    </section>

                    <section className="space-y-3">
                        <Label className="text-base">
                            Price tiers (e.g. Specialist / Consultant)
                        </Label>
                        {tiers.rows.map(({ key, value }, index) => (
                            <div
                                key={key}
                                className="space-y-3 rounded-md border p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-muted-foreground">
                                        Tier {index + 1}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => tiers.remove(key)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <LangInputs
                                    prefix={`price_tiers[${index}]`}
                                    base="label"
                                    values={
                                        value as unknown as Record<
                                            string,
                                            string | null
                                        >
                                    }
                                    required
                                />
                                <div className="grid gap-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Amount (SAR)
                                    </Label>
                                    <Input
                                        name={`price_tiers[${index}][amount]`}
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        defaultValue={value.amount}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={tiers.add}
                        >
                            Add price tier
                        </Button>
                    </section>

                    <section className="space-y-3">
                        <Label className="text-base">Stages (trimesters)</Label>
                        {stages.rows.map(({ key, value }, index) => (
                            <StageFields
                                key={key}
                                index={index}
                                stage={value}
                                onRemove={() => stages.remove(key)}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={stages.add}
                        >
                            Add stage
                        </Button>
                    </section>

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}

function StageFields({
    index,
    stage,
    onRemove,
}: {
    index: number;
    stage: Stage;
    onRemove: () => void;
}) {
    const tests = useRows<StageTest>(stage.tests ?? [], () => ({
        name: '',
        code: null,
    }));

    return (
        <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm">Stage {index + 1}</Label>
                <Button type="button" variant="ghost" onClick={onRemove}>
                    Remove stage
                </Button>
            </div>

            <LangInputs
                prefix={`stages[${index}]`}
                base="name"
                values={stage as unknown as Record<string, string | null>}
                required
            />

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                        Subtitle (English)
                    </Label>
                    <Input
                        name={`stages[${index}][subtitle_en]`}
                        defaultValue={stage.subtitle_en ?? ''}
                    />
                </div>
                <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                        Subtitle (Arabic)
                    </Label>
                    <Input
                        name={`stages[${index}][subtitle_ar]`}
                        dir="rtl"
                        defaultValue={stage.subtitle_ar ?? ''}
                    />
                </div>
                <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                        Free consultations
                    </Label>
                    <Input
                        name={`stages[${index}][free_consultations]`}
                        type="number"
                        min={0}
                        defaultValue={stage.free_consultations}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tests</Label>
                {tests.rows.map(({ key, value }, testIndex) => (
                    <div key={key} className="flex items-end gap-2">
                        <div className="grid flex-1 gap-1">
                            <Label className="text-xs text-muted-foreground">
                                Name
                            </Label>
                            <Input
                                name={`stages[${index}][tests][${testIndex}][name]`}
                                defaultValue={value.name}
                                required
                            />
                        </div>
                        <div className="grid flex-1 gap-1">
                            <Label className="text-xs text-muted-foreground">
                                Code
                            </Label>
                            <Input
                                name={`stages[${index}][tests][${testIndex}][code]`}
                                defaultValue={value.code ?? ''}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => tests.remove(key)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={tests.add}>
                    Add test
                </Button>
            </div>
        </div>
    );
}
