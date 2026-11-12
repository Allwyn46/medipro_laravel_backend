import * as React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    CheckCircle2Icon,
    ClockIcon,
    CalendarIcon,
    StethoscopeIcon,
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    MailIcon,
    SparklesIcon,
    ArrowRightIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/appointment";

interface ConfirmedPageProps {
    appointment: Appointment;
    role: "patient" | "doctor";
    bothConfirmed: boolean;
    alreadyConfirmed: boolean;
    patientConfirmed: boolean;
    doctorConfirmed: boolean;
}

export default function ConfirmedPage({
    appointment,
    role,
    bothConfirmed,
    alreadyConfirmed,
    patientConfirmed,
    doctorConfirmed,
}: ConfirmedPageProps) {
    const isPatient = role === "patient";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between antialiased selection:bg-emerald-500 selection:text-white">
            <Head title={bothConfirmed ? "Appointment Confirmed & Booked" : "Confirmation Received - MediPro"} />

            {/* Navigation Bar */}
            <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
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
                        Clinician Dashboard
                    </Button>
                </div>
            </header>

            {/* Main Content Hero */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-xl flex flex-col gap-6">
                    {/* Hero Card */}
                    <Card className="border shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                        <div
                            className={
                                bothConfirmed
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 sm:p-8 text-center"
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 sm:p-8 text-center"
                            }
                        >
                            <div className="inline-flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs text-white mb-3 shadow-inner">
                                {bothConfirmed ? (
                                    <CheckCircle2Icon className="size-8" />
                                ) : (
                                    <ClockIcon className="size-8 animate-pulse" />
                                )}
                            </div>

                            <div className="flex justify-center mb-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white hover:bg-white/25 border-transparent text-xs font-semibold px-3 py-0.5"
                                >
                                    {bothConfirmed
                                        ? "Dual Confirmation Complete"
                                        : isPatient
                                        ? "Awaiting Doctor Confirmation"
                                        : "Awaiting Patient Confirmation"}
                                </Badge>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {bothConfirmed
                                    ? "Appointment Officially Booked!"
                                    : alreadyConfirmed
                                    ? "Confirmation Already Recorded"
                                    : "Thank You! Confirmation Received"}
                            </h1>

                            <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-md mx-auto leading-relaxed">
                                {bothConfirmed ? (
                                    isPatient ? (
                                        <>
                                            Both you and <strong>{appointment.doctor}</strong> have confirmed.
                                            Your clinical consultation is officially booked into the schedule.
                                        </>
                                    ) : (
                                        <>
                                            Both you and <strong>{appointment.patient_name}</strong> have confirmed.
                                            This consultation is locked onto your clinic schedule.
                                        </>
                                    )
                                ) : isPatient ? (
                                    <>
                                        Your confirmation has been saved. As soon as <strong>{appointment.doctor}</strong> confirms
                                        their schedule, this appointment will be fully booked.
                                    </>
                                ) : (
                                    <>
                                        You have confirmed your availability for <strong>{appointment.patient_name}</strong>.
                                        The appointment will be fully booked once the patient confirms via their email.
                                    </>
                                )}
                            </p>
                        </div>

                        <CardContent className="p-6 sm:p-7 flex flex-col gap-5">
                            {/* Dual Confirmation Progress Bar */}
                            <div className="flex flex-col gap-2 p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <SparklesIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Dual Confirmation Status
                                </span>
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                    <div
                                        className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                                            patientConfirmed
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                                                : "bg-muted/50 border-border text-muted-foreground"
                                        }`}
                                    >
                                        {patientConfirmed ? (
                                            <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <ClockIcon className="size-4 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">Patient</p>
                                            <p className="text-[10px] opacity-80">
                                                {patientConfirmed ? "Confirmed" : "Pending email click"}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                                            doctorConfirmed
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                                                : "bg-muted/50 border-border text-muted-foreground"
                                        }`}
                                    >
                                        {doctorConfirmed ? (
                                            <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <ClockIcon className="size-4 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">Doctor</p>
                                            <p className="text-[10px] opacity-80">
                                                {doctorConfirmed ? "Confirmed" : "Pending email click"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Specs Card */}
                            <div className="flex flex-col gap-3 rounded-xl border p-4 bg-card text-xs">
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b">
                                    <CalendarIcon className="size-4 text-primary" />
                                    Consultation Details
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Patient Name</span>
                                        <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                                            <UserIcon className="size-3.5 text-muted-foreground" />
                                            {appointment.patient_name}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Assigned Specialist</span>
                                        <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                                            <StethoscopeIcon className="size-3.5 text-emerald-600" />
                                            {appointment.doctor}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Clinical Service</span>
                                        <span className="font-semibold text-foreground mt-0.5 block">
                                            {appointment.service}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Scheduled Slot</span>
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                            <ClockIcon className="size-3.5" />
                                            {appointment.date} at {appointment.time}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Clinic Suite</span>
                                        <span className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                                            <MapPinIcon className="size-3.5 text-muted-foreground" />
                                            {appointment.room || "Consultation Suite 1"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-muted-foreground block text-[11px]">Contact</span>
                                        <span className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                                            <PhoneIcon className="size-3.5 text-muted-foreground" />
                                            {appointment.patient_phone || "On file"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto text-xs"
                                    render={<Link href="/" prefetch />}
                                >
                                    Visit MediPro Portal
                                </Button>
                                <Button
                                    className="w-full sm:w-auto text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                                    render={<Link href="/dashboard" prefetch />}
                                >
                                    Go to Dashboard
                                    <ArrowRightIcon className="size-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} MediPro Clinical Consultation Network. All rights reserved.
            </footer>
        </div>
    );
}
