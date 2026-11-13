import * as React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    CalendarX2Icon,
    CalendarIcon,
    StethoscopeIcon,
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    ArrowRightIcon,
    ClockIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/appointment";

interface ExpiredPageProps {
    appointment: Appointment;
    rebookUrl?: string;
}

export default function ExpiredPage({
    appointment,
    rebookUrl = "/#booking",
}: ExpiredPageProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between antialiased selection:bg-amber-500 selection:text-white">
            <Head title="Appointment Slot Expired - MediPro" />

            {/* Navigation Bar */}
            <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
                        <StethoscopeIcon className="size-5" />
                    </div>
                    <div>
                        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                            MediPro
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                            Clinical Consultation Network
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        render={<Link href="/" prefetch />}
                    >
                        Client Portal
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        render={<Link href="/dashboard" prefetch />}
                    >
                        Staff Dashboard
                    </Button>
                </div>
            </header>

            {/* Main Content Hero */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-xl flex flex-col gap-6">
                    {/* Hero Card */}
                    <Card className="border shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white p-6 sm:p-8 text-center">
                            <div className="inline-flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs text-white mb-3 shadow-inner">
                                <CalendarX2Icon className="size-8" />
                            </div>

                            <div className="flex justify-center mb-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white hover:bg-white/30 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5"
                                >
                                    Slot Forfeited — Reschedule
                                </Badge>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Appointment Slot Expired
                            </h1>
                            <p className="mt-2 text-white/90 text-sm max-w-md mx-auto leading-relaxed">
                                This consultation request was not confirmed prior to the 15-minute start cutoff and the calendar slot has been released.
                            </p>
                        </div>

                        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
                            {/* Consultation Summary */}
                            <div className="rounded-xl border bg-muted/40 p-4 sm:p-5 flex flex-col gap-3.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Expired Consultation Details
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-start gap-2.5">
                                        <UserIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Specialist</span>
                                            <span className="font-semibold text-foreground">
                                                {appointment.doctor}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <StethoscopeIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Clinical Service</span>
                                            <span className="font-semibold text-foreground">
                                                {appointment.service}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <CalendarIcon className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Date</span>
                                            <span className="font-semibold text-foreground">
                                                {appointment.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <ClockIcon className="size-4 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Scheduled Time</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                {appointment.time} (Expired)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rebooking CTA */}
                            <div className="flex flex-col gap-3 text-center sm:text-left">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    We would love to help you receive the clinical care you need. Please choose an alternate date and time from our live specialist schedule.
                                </p>
                                <Button
                                    size="lg"
                                    className="w-full h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2"
                                    render={<a href={rebookUrl} />}
                                >
                                    <span>Select a New Appointment Time</span>
                                    <ArrowRightIcon className="size-4" />
                                </Button>
                            </div>

                            {/* Contact Box */}
                            <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
                                <span className="flex items-center gap-1.5">
                                    <PhoneIcon className="size-3.5" />
                                    Clinic Desk: +91 98765 43210
                                </span>
                                <span>Hours: Mon–Sat, 8:00 AM – 8:00 PM</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} MediPro Specialist Network &bull; All rights reserved.</p>
            </footer>
        </div>
    );
}
