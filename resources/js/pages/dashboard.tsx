import { AppointmentsTable } from "@/components/appointments-table";
import { SectionCards } from "@/components/section-cards";
import Layout from "./layout/Layout";

export default function Page() {
    return (
        <Layout title="Dashboard">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="pl-5">
                            <h1 className="text-2xl font-medium font-sans tracking-tight leading-tight text-slate-900 dark:text-navy-50 lg:text-3xl">
                                Welcome back, Allwyn!
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground lg:text-base">
                                Your clinic’s bookings, leads, and daily
                                schedule at a glance.
                            </p>
                        </div>
                        <SectionCards />
                        <AppointmentsTable />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
