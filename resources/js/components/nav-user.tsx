import { Link, router, usePage } from "@inertiajs/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    EllipsisVerticalIcon,
    CircleUserRoundIcon,
    SettingsIcon,
    UserPlusIcon,
    LogOutIcon,
} from "lucide-react";

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    const { isMobile } = useSidebar();
    const { auth } = usePage().props as unknown as {
        auth?: {
            user?: { role?: string; name?: string; email?: string };
            doctor?: { name?: string; specialty?: string };
            role?: string;
        };
    };

    const isAdmin = auth?.user?.role === "admin" || auth?.role === "admin";
    const displayName = auth?.doctor?.name || auth?.user?.name || user.name;
    const displaySub = auth?.doctor?.specialty || (isAdmin ? "Clinic Administrator" : (auth?.user?.email || user.email));

    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "CN";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="aria-expanded:bg-muted"
                            />
                        }
                    >
                        <Avatar className="size-8 rounded-lg grayscale">
                            <AvatarImage src={user.avatar} alt={displayName} />
                            <AvatarFallback className="rounded-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {displayName}
                            </span>
                            <span className="truncate text-xs text-foreground/70">
                                {displaySub}
                            </span>
                        </div>
                        <EllipsisVerticalIcon className="ml-auto size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {displayName}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {displaySub}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <CircleUserRoundIcon />
                                Account ({isAdmin ? "Administrator" : "Doctor"})
                            </DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => router.visit("/settings/leads")}
                                        className="cursor-pointer"
                                    >
                                        <SettingsIcon />
                                        Lead Form Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.visit("/settings/doctors")}
                                        className="cursor-pointer"
                                    >
                                        <UserPlusIcon />
                                        Manage Doctors
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.post("/logout")}
                            className="cursor-pointer"
                        >
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
