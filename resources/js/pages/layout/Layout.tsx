import { Head } from "@inertiajs/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({
    children,
    title,
}: {
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <Head title={title} />
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={title} />
                {children}
            </SidebarInset>
            <Toaster position="top-right" richColors />
        </SidebarProvider>
    );
}
