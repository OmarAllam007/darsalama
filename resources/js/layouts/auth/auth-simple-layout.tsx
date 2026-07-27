import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, HeartPulse, ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import logo from '@/site/assets/images/logo.png';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative min-h-svh overflow-hidden bg-[#f3f1e9] px-4 py-6 font-sans sm:px-6 lg:p-8">
            <div className="pointer-events-none absolute -top-36 -right-24 size-96 rounded-full border border-[#c9a94f]/20" />
            <div className="pointer-events-none absolute -right-6 -bottom-44 size-80 rounded-full bg-[#c9a94f]/8 blur-3xl" />

            <div className="relative mx-auto grid min-h-[calc(100svh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_90px_-32px_rgba(21,38,92,0.38)] lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
                <aside className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#192d68_0%,#101735_62%,#0b1028_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="pointer-events-none absolute -top-28 -right-28 size-80 rounded-full border border-[#d8ba66]/20" />
                    <div className="pointer-events-none absolute top-1/3 -left-32 size-80 rounded-full bg-[#d8ba66]/8 blur-3xl" />
                    <HeartPulse className="pointer-events-none absolute right-10 bottom-8 size-56 text-white/[0.035]" />

                    <Link
                        href={home()}
                        className="relative z-10 inline-flex w-fit items-center rounded-2xl bg-white px-4 py-2.5 shadow-xl"
                    >
                        <img
                            src={logo}
                            alt="Dar As Salama Medical Hospital"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>

                    <div className="relative z-10 max-w-lg">
                        <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#d8ba66] uppercase">
                            <span className="h-px w-10 bg-[#d8ba66]" />
                            Staff operations portal
                        </div>
                        <h2 className="max-w-md text-5xl leading-[1.04] font-semibold tracking-[-0.04em] text-white">
                            Care, coordinated with confidence.
                        </h2>
                        <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                            A focused workspace for the teams behind every
                            patient journey at {name}.
                        </p>

                        <div className="mt-10 grid gap-4 text-sm text-white/75">
                            {[
                                'Manage appointments and patient requests',
                                'Keep clinical directories accurate',
                                'Review operational insights in one place',
                            ].map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="size-4 text-[#d8ba66]" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-xs text-white/40">
                        <ShieldCheck className="size-4 text-[#d8ba66]/70" />
                        Protected staff access
                    </div>
                </aside>

                <main className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-10 inline-flex rounded-2xl border border-[#e4e0d4] bg-white px-3 py-2 shadow-sm lg:hidden"
                        >
                            <img
                                src={logo}
                                alt="Dar As Salama Medical Hospital"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>

                        <div className="mb-9">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f4f1e7] px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#8e7029] uppercase ring-1 ring-[#c9a94f]/15">
                                <ShieldCheck className="size-3.5" />
                                Secure staff access
                            </div>
                            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#172047] sm:text-4xl">
                                {title}
                            </h1>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-[#73798b]">
                                {description}
                            </p>
                        </div>

                        {children}

                        <p className="mt-10 text-center text-xs leading-5 text-[#989dad]">
                            Authorized personnel only · All access is monitored
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
