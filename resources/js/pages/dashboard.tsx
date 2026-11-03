import { AppointmentsTable } from "@/components/appointments-table";
import { SectionCards, type MetricCardItem } from "@/components/section-cards";
import type { Appointment } from "@/types/appointment";
import Layout from "./layout/Layout";

interface DashboardPageProps {
    metrics?: MetricCardItem[];
    appointments?: Appointment[];
    pendingAppointments?: Appointment[];
}

export default function Page({
    metrics,
    appointments = [],
    pendingAppointments = [],
}: DashboardPageProps) {
    return (
        <Layout title="Dashboard">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="pl-5">
                            <h1 className="text-4xl font-medium font-sans tracking-tight leading-tight text-slate-900 dark:text-navy-50 lg:text-4xl">
                                Welcome back, Allwyn!
                            </h1>
                            <p className="mt-1 text-sm font-sans tracking-tight text-muted-foreground lg:text-base">
                                Your clinic’s bookings, leads, and daily
                                schedule at a glance.
                            </p>
                        </div>
                        <SectionCards items={metrics} />
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
