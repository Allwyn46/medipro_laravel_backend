import * as React from "react";
import { usePage } from "@inertiajs/react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    LayoutDashboardIcon,
    ListIcon,
    ChartBarIcon,
    FolderIcon,
    UsersIcon,
    CameraIcon,
    FileTextIcon,
    Settings2Icon,
    CircleHelpIcon,
    SearchIcon,
    DatabaseIcon,
    FileChartColumnIcon,
    FileIcon,
    CommandIcon,
    StethoscopeIcon,
} from "lucide-react";

const data = {
    user: {
        name: "Clinic Administrator",
        email: "admin@medipro.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: <LayoutDashboardIcon />,
        },
        {
            title: "Pipeline",
            url: "/pipeline",
            icon: <ListIcon />,
        },
        {
            title: "Leads",
            url: "/leads",
            icon: <ChartBarIcon />,
        },
        // {
        //     title: "Projects",
        //     url: "#",
        //     icon: <FolderIcon />,
        // },
        // {
        //     title: "Team",
        //     url: "#",
        //     icon: <UsersIcon />,
        // },
    ],
    // navClouds: [
    //     {
    //         title: "Capture",
    //         icon: <CameraIcon />,
    //         isActive: true,
    //         url: "#",
    //         items: [
    //             {
    //                 title: "Active Proposals",
    //                 url: "#",
    //             },
    //             {
    //                 title: "Archived",
    //                 url: "#",
    //             },
    //         ],
    //     },
    //     {
    //         title: "Proposal",
    //         icon: <FileTextIcon />,
    //         url: "#",
    //         items: [
    //             {
    //                 title: "Active Proposals",
    //                 url: "#",
    //             },
    //             {
    //                 title: "Archived",
    //                 url: "#",
    //             },
    //         ],
    //     },
    //     {
    //         title: "Prompts",
    //         icon: <FileTextIcon />,
    //         url: "#",
    //         items: [
    //             {
    //                 title: "Active Proposals",
    //                 url: "#",
    //             },
    //             {
    //                 title: "Archived",
    //                 url: "#",
    //             },
    //         ],
    //     },
    // ],
    // navSecondary: [
    //     {
    //         title: "Settings",
    //         url: "#",
    //         icon: <Settings2Icon />,
    //     },
    //     {
    //         title: "Get Help",
    //         url: "#",
    //         icon: <CircleHelpIcon />,
    //     },
    //     {
    //         title: "Search",
    //         url: "#",
    //         icon: <SearchIcon />,
    //     },
    // ],
    // documents: [
    //     {
    //         name: "Data Library",
    //         url: "#",
    //         icon: <DatabaseIcon />,
    //     },
    //     {
    //         name: "Reports",
    //         url: "#",
    //         icon: <FileChartColumnIcon />,
    //     },
    //     {
    //         name: "Word Assistant",
    //         url: "#",
    //         icon: <FileIcon />,
    //     },
    // ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage().props as unknown as {
        auth?: {
            user?: { role?: string; name?: string; email?: string };
            doctor?: { name?: string; specialty?: string };
            role?: string;
        };
    };

    const isAdmin = auth?.user?.role === "admin" || auth?.role === "admin";
    const displayName = auth?.doctor?.name || auth?.user?.name || "Clinic Staff";
    const displayEmail = auth?.doctor?.specialty || (isAdmin ? "Clinic Administrator" : (auth?.user?.email || "staff@medipro.com"));

    const currentUser = {
        name: displayName,
        email: displayEmail,
        avatar: "/avatars/shadcn.jpg",
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                            render={<a href="/dashboard" />}
                        >
                            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-600 text-white shadow-xs">
                                <StethoscopeIcon className="size-4" />
                            </div>
                            <span className="text-base font-semibold">
                                Medi Pro
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/* <NavDocuments items={data.documents} /> */}
                {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={currentUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
