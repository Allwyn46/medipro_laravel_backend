import { Link, usePage } from "@inertiajs/react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
        isActive?: boolean;
    }[];
}) {
    const { url } = usePage();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isCurrentActive =
                            item.isActive ??
                            (item.url !== "#" &&
                                (url === item.url ||
                                    (item.url !== "/" &&
                                        (url.startsWith(`${item.url}/`) ||
                                            url.startsWith(`${item.url}?`)))));

                        return (
                            <SidebarMenuItem
                                className="font-sans font-medium"
                                key={item.title}
                            >
                                <SidebarMenuButton
                                    render={
                                        item.url !== "#" ? (
                                            <Link href={item.url} prefetch />
                                        ) : (
                                            <a href="#" />
                                        )
                                    }
                                    isActive={isCurrentActive}
                                    tooltip={item.title}
                                    className={cn(
                                        "transition-colors duration-150",
                                        isCurrentActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )}
                                >
                                    {item.icon}
                                    <span className="text-sm">{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
