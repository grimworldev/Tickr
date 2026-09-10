import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 [font-family:'Space_Grotesk',sans-serif]">
                {/* Left panel */}
                <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(-45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
                        }}
                    />

                    <Link href={home()} className="relative z-20 flex items-center gap-2.5 text-lg font-medium">
                        <span className="flex size-8 items-center justify-center rounded-md bg-white">
                            <AppLogoIcon className="size-5" />
                        </span>
                        {name}
                    </Link>

                    <div className="relative z-20 max-w-xs">
                        <p className="text-2xl leading-snug font-medium">
                            Every plate, timestamped the moment it enters.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                            No logbook, no guesswork at checkout — just a running record
                            of every vehicle on the lot.
                        </p>
                    </div>

                    {/* Mini ticket stub, echoes the landing page hero */}
                    <div className="relative z-20 w-56 rounded-md bg-white/10 backdrop-blur-sm">
                        <div className="space-y-2.5 px-4 pt-4 pb-3">
                            <div className="flex items-center justify-between text-[10px] text-primary-foreground/60">
                                <span>Entry ticket</span>
                                <span className="[font-family:'JetBrains_Mono',monospace]">No. 0412</span>
                            </div>
                            <div className="text-base font-semibold tracking-wide [font-family:'JetBrains_Mono',monospace]">
                                GWA 204
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="absolute -left-2 size-4 rounded-full bg-primary" />
                            <div className="mx-3 flex-1 border-t border-dashed border-primary-foreground/25" />
                            <span className="absolute -right-2 size-4 rounded-full bg-primary" />
                        </div>
                        <div className="flex justify-between px-4 pt-2.5 pb-4 text-xs [font-family:'JetBrains_Mono',monospace]">
                            <span className="text-primary-foreground/60">10:14 AM</span>
                            <span className="font-medium">₱20.00/hr</span>
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div className="w-full lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <Link href={home()} className="relative z-20 flex items-center justify-center gap-2 lg:hidden">
                            <span className="flex size-9 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <span className="text-lg font-medium">{name}</span>
                        </Link>
                        <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}