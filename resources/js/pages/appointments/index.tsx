import * as React from "react";
import { usePage, Link } from "@inertiajs/react";
import Layout from "../layout/Layout";
import { AppointmentsRegistryTable } from "@/components/appointments-registry-table";
import { SectionCards, type MetricCardItem } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/appointment";
import {
    CalendarIcon,
    LayoutDashboardIcon,
    ListIcon,
} from "lucide-react";

interface DoctorOption {
    id: number;
    name: string;
    specialty: string;
    room?: string;
    email?: string;
    phone?: string;
}

interface AppointmentsPageProps {
    appointments?: Appointment[];
    doctors?: DoctorOption[];
    isAdmin?: boolean;
    selectedDoctorId?: number | null;
}

export default function AppointmentsPage({
    appointments = [],
    doctors = [],
    isAdmin = false,
    selectedDoctorId = null,
}: AppointmentsPageProps) {
    const { auth } = usePage().props as unknown as {
        auth?: {
            user?: { role?: string; name?: string };
            doctor?: { name?: string; specialty?: string };
        };
    };

    const isDoctor = auth?.user?.role === "doctor" || !!auth?.doctor;
    const greetingName = auth?.doctor?.name || auth?.user?.name || "Clinician";

    const subtitle = isDoctor
        ? "Comprehensive schedule of your assigned patient consultations, clinical procedures, and specialist bookings."
        : "Clinic-wide schedule and audit registry of patient consultations, procedures, and specialist appointments.";

    // Calculate metrics
    const totalAppointments = appointments.length;
    const confirmedCount = appointments.filter(
        (a) => a.status === "Confirmed" || a.status === "Scheduled",
    ).length;
    const pendingActionCount = appointments.filter(
        (a) => a.status === "Pending" || a.status === "Awaiting Confirmation",
    ).length;
    const completedCount = appointments.filter((a) => a.status === "Completed").length;

    const metricCards: MetricCardItem[] = React.useMemo(
        () => [
            {
                title: "Total Appointments",
                value: `${totalAppointments} Visits`,
                badgeText: "All Records",
                badgeTrend: "up",
                footerTrendText: "Clinical Schedule",
                footerSubtext: isDoctor ? `Assigned to ${greetingName}` : "Across all clinic specialists",
            },
            {
                title: "Confirmed Visits",
                value: `${confirmedCount}`,
                badgeText: "Ready",
                badgeTrend: "up",
                footerTrendText: "Scheduled & Confirmed",
                footerSubtext: "Patient arrival expected",
            },
            {
                title: "Action Required",
                value: `${pendingActionCount}`,
                badgeText: pendingActionCount > 0 ? "Pending" : "Clear",
                badgeTrend: pendingActionCount > 0 ? "down" : "up",
                footerTrendText: "Unconfirmed Bookings",
                footerSubtext: "Pending doctor/patient confirmation",
            },
            {
                title: "Completed Procedures",
                value: `${completedCount}`,
                badgeText: "Archived",
                badgeTrend: "up",
                footerTrendText: "Finished Consultations",
                footerSubtext: "Documented clinical visits",
            },
        ],
        [totalAppointments, confirmedCount, pendingActionCount, completedCount, isDoctor, greetingName],
    );

    return (
        <Layout title="Appointments">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-medium font-sans tracking-tight text-foreground lg:text-4xl">
                                Appointments Registry
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-sans tracking-tight text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            render={<Link href="/dashboard" prefetch />}
                            className="text-xs gap-1.5"
                        >
                            <LayoutDashboardIcon className="size-3.5" />
                            Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            render={<Link href="/pipeline" prefetch />}
                            className="text-xs gap-1.5"
                        >
                            <ListIcon className="size-3.5" />
                            Pipeline Board
                        </Button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <SectionCards items={metricCards} className="px-0 lg:px-0" />

                {/* Appointments Registry Table */}
                <AppointmentsRegistryTable
                    appointments={appointments}
                    doctors={doctors}
                    isAdmin={isAdmin}
                    initialDoctorId={selectedDoctorId}
                />
            </div>
        </Layout>
    );
}
