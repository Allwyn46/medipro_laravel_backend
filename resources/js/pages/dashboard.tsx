import { router, usePage } from "@inertiajs/react";
import { AppointmentsTable } from "@/components/appointments-table";
import { SectionCards, type MetricCardItem } from "@/components/section-cards";
import {
    DoctorRevenueBreakdown,
    type DoctorRevenueItem,
} from "@/components/doctor-revenue-breakdown";
import type { Appointment } from "@/types/appointment";
import Layout from "./layout/Layout";

interface DashboardPageProps {
    metrics?: MetricCardItem[];
    appointments?: Appointment[];
    pendingAppointments?: Appointment[];
    doctorRevenues?: DoctorRevenueItem[];
    selectedDoctorId?: number | null;
}

export default function Page({
    metrics,
    appointments = [],
    pendingAppointments = [],
    doctorRevenues = [],
    selectedDoctorId = null,
}: DashboardPageProps) {
    const { auth } = usePage().props as unknown as {
        auth?: {
            user?: { role?: string; name?: string };
            doctor?: { name?: string; specialty?: string };
        };
    };

    const isDoctor = auth?.user?.role === "doctor" || !!auth?.doctor;
    const isAdmin = auth?.user?.role === "admin";
    const greetingName = auth?.doctor?.name || auth?.user?.name || "Clinician";
    const subtitle = isDoctor
        ? "Your patient consultations, assigned leads, and daily schedule at a glance."
        : "Your clinic’s bookings, leads, and daily schedule at a glance.";

    const selectedDoc = doctorRevenues.find((d) => d.id === selectedDoctorId);

    return (
        <Layout title="Dashboard">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="pl-5">
                            <h1 className="text-4xl font-medium font-sans tracking-tight leading-tight text-slate-900 dark:text-navy-50 lg:text-4xl">
                                Welcome back, {greetingName}!
                            </h1>
                            <p className="mt-1 text-sm font-sans tracking-tight text-muted-foreground lg:text-base">
                                {subtitle}
                            </p>
                        </div>

                        {/* Admin Filter Indicator */}
                        {isAdmin && selectedDoctorId && selectedDoc && (
                            <div className="mx-4 lg:mx-6 flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                                <div className="flex items-center gap-2 font-medium text-foreground">
                                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                                    <span>
                                        Filtered View: Showing consultations and revenue for{" "}
                                        <strong className="text-primary font-semibold">
                                            {selectedDoc.name}
                                        </strong>{" "}
                                        ({selectedDoc.specialty})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.visit("/dashboard")}
                                    className="text-primary hover:underline font-semibold cursor-pointer"
                                >
                                    Reset to Clinic-wide Overview &rarr;
                                </button>
                            </div>
                        )}

                        <SectionCards items={metrics} />

                        {/* Doctor-Wise Revenue Breakdown: Visible ONLY for Admin */}
                        {isAdmin && (
                            <DoctorRevenueBreakdown
                                doctorRevenues={doctorRevenues}
                                selectedDoctorId={selectedDoctorId}
                            />
                        )}

                        <AppointmentsTable
                            appointments={appointments}
                            pendingAppointments={pendingAppointments}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
