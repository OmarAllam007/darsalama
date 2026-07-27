import { Form, Head } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold tracking-wide text-[#323a54]"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#9298a9]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="name@hospital.com"
                                        className="h-12 rounded-xl border-[#dedbd0] bg-[#fbfaf7] pr-4 pl-11! shadow-none transition placeholder:text-[#afb2bc] focus-visible:border-[#c9a94f] focus-visible:ring-[#c9a94f]/15"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2.5">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold tracking-wide text-[#323a54]"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-semibold text-[#8e7029] no-underline hover:text-[#15265c]"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-[#9298a9]" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-12 rounded-xl border-[#dedbd0] bg-[#fbfaf7] pr-11 pl-11! shadow-none transition placeholder:text-[#afb2bc] focus-visible:border-[#c9a94f] focus-visible:ring-[#c9a94f]/15"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="size-[18px] rounded-md border-[#cfcbbf] data-[state=checked]:border-[#15265c] data-[state=checked]:bg-[#15265c]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-normal text-[#656c7e]"
                                >
                                    Keep me signed in on this device
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="group mt-1 h-12 w-full rounded-xl bg-[linear-gradient(135deg,#1c326f,#101735)] text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(21,38,92,0.65)] transition hover:-translate-y-0.5 hover:brightness-110"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {processing
                                    ? 'Signing in...'
                                    : 'Sign in securely'}
                                {!processing && (
                                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <span>{status}</span>
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description:
        'Sign in to access appointments, patient requests, and hospital operations.',
};
