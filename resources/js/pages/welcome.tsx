import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { dashboard, login, register } from '@/routes';
import AppLogo from '@/components/app-logo';

const RATE_PER_HOUR = 20;

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'Compare', href: '#compare' },
    { label: 'How it works', href: '#how-it-works' },
];

const FEATURES = [
    {
        label: 'Plate capture',
        body: 'Type a plate number and press enter. No dropdowns, no multi-step forms, no second screen.',
    },
    {
        label: 'Live rates',
        body: 'Fees calculate themselves against the clock, so nobody is doing hourly math at the booth.',
    },
    {
        label: 'One shared log',
        body: 'Every attendant on every shift sees the same list, updated the moment a car moves.',
    },
    {
        label: 'Searchable records',
        body: 'Look up a plate from three weeks ago in seconds instead of flipping through notebooks.',
    },
];

const STEPS = [
    {
        title: 'Vehicle enters',
        body: 'The attendant logs the plate number at the gate.',
    },
    {
        title: 'Clock starts',
        body: 'Entry time is stamped automatically — no writing it down.',
    },
    {
        title: 'Vehicle exits',
        body: 'The attendant pulls the plate back up from the log.',
    },
    {
        title: 'Fee is set',
        body: 'The hourly rate applies itself and the ticket closes.',
    },
];

function formatClock(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const amountDue = ((elapsed / 3600) * RATE_PER_HOUR).toFixed(2);

    return (
        <>
            <Head title="Tickr — Parking, logged automatically">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen scroll-smooth bg-background text-foreground [font-family:'Space_Grotesk',sans-serif]">
                {/* Nav */}
                <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
                        <div className="flex items-center justify-center rounded-md">
                            <AppLogo />
                        </div>

                        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                            {NAV_LINKS.map((link) => (
                                <a key={link.href} href={link.href} className="hover:text-foreground">
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:opacity-90"
                                >
                                    Open dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:opacity-90"
                                    >
                                        Create account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-12 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:pt-20">
                    <div>
                        <h1 className="max-w-md text-4xl leading-[1.1] font-semibold tracking-tight lg:text-5xl">
                            The logbook is closed.
                        </h1>
                        <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
                            Tickr logs every plate, entry time, and fee the moment a car
                            pulls into your lot. No paper, no mental math at the gate,
                            no torn pages at the end of a shift.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                            >
                                {auth.user ? 'Open dashboard' : 'Log in to your lot'}
                            </Link>
                            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                                See how it works
                            </a>
                        </div>
                    </div>

                    {/* Ticket stub */}
                    <div className="relative mx-auto w-full max-w-sm rounded-lg bg-primary text-primary-foreground shadow-xl">
                        <div className="space-y-4 px-6 pt-6 pb-5">
                            <div className="flex items-center justify-between text-xs text-primary-foreground/70">
                                <span>Tickr entry ticket</span>
                                <span className="[font-family:'JetBrains_Mono',monospace]">No. 0412</span>
                            </div>
                            <div>
                                <div className="text-xs text-primary-foreground/70">Plate</div>
                                <div className="text-2xl font-semibold tracking-wide [font-family:'JetBrains_Mono',monospace]">
                                    GWA 204
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-xs text-primary-foreground/70">Time in</div>
                                    <div className="text-sm [font-family:'JetBrains_Mono',monospace]">10:14 AM</div>
                                </div>
                                <div>
                                    <div className="text-xs text-primary-foreground/70">Rate</div>
                                    <div className="text-sm [font-family:'JetBrains_Mono',monospace]">
                                        ₱{RATE_PER_HOUR.toFixed(2)}/hr
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Perforated tear line */}
                        <div className="relative flex items-center">
                            <span className="absolute -left-2.5 size-5 rounded-full bg-background" />
                            <div className="mx-4 flex-1 border-t border-dashed border-primary-foreground/30" />
                            <span className="absolute -right-2.5 size-5 rounded-full bg-background" />
                        </div>

                        <div className="flex items-end justify-between px-6 pt-5 pb-6">
                            <div>
                                <div className="text-xs text-primary-foreground/70">Duration</div>
                                <div className="text-lg [font-family:'JetBrains_Mono',monospace]">
                                    {formatClock(elapsed)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-primary-foreground/70">Amount due</div>
                                <div className="text-lg font-semibold [font-family:'JetBrains_Mono',monospace]">
                                    ₱{amountDue}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-6xl scroll-mt-20 border-t border-border px-6 py-20 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                        <h2 className="max-w-xs text-2xl leading-snug font-semibold tracking-tight">
                            Built for the booth, not the back office.
                        </h2>
                        <div className="grid gap-8 sm:grid-cols-2">
                            {FEATURES.map((f) => (
                                <div key={f.label}>
                                    <h3 className="font-medium">{f.label}</h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Logbook vs Tickr */}
                <section id="compare" className="scroll-mt-20 border-t border-border bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
                        <h2 className="max-w-md text-2xl leading-snug font-semibold tracking-tight">
                            Same job, a very different Friday night.
                        </h2>
                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            <div
                                className="rounded-lg border border-border bg-card p-6"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(transparent, transparent 27px, var(--border) 28px)',
                                }}
                            >
                                <div className="text-xs font-medium text-muted-foreground">The logbook</div>
                                <p className="mt-4 text-lg leading-loose italic">
                                    Plate hard to read, time in guessed at, rate calculated
                                    by hand at checkout — and the page from last Tuesday is
                                    somewhere in a drawer.
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="text-xs font-medium text-muted-foreground [font-family:'JetBrains_Mono',monospace]">
                                    Tickr
                                </div>
                                <div className="mt-4 space-y-3 [font-family:'JetBrains_Mono',monospace] text-sm">
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <span className="text-muted-foreground">Plate</span>
                                        <span>GWA 204</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <span className="text-muted-foreground">Time in</span>
                                        <span>10:14 AM</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <span className="text-muted-foreground">Time out</span>
                                        <span>12:41 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount due</span>
                                        <span className="font-medium">₱49.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:px-8">
                    <h2 className="max-w-md text-2xl leading-snug font-semibold tracking-tight">
                        Every vehicle follows the same four steps.
                    </h2>
                    <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, i) => (
                            <div key={step.title} className="border-t border-border pt-4">
                                <div className="text-xs text-muted-foreground [font-family:'JetBrains_Mono',monospace]">
                                    No. {String(i + 1).padStart(2, '0')}
                                </div>
                                <h3 className="mt-2 font-medium">{step.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Closing CTA */}
                <section className="border-t border-border">
                    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 lg:flex-row lg:items-center lg:px-8">
                        <h2 className="text-2xl font-semibold tracking-tight">Ready to close the logbook?</h2>
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                        >
                            {auth.user ? 'Open dashboard' : 'Log in to your lot'}
                        </Link>
                    </div>
                </section>

                <footer className="border-t border-border px-6 py-8 text-sm text-muted-foreground lg:px-8">
                    <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} Tickr</div>
                </footer>
            </div>
        </>
    );
}