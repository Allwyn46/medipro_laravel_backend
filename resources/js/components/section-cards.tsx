"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardItem {
    title: string;
    value: string | number;
    badgeText: string;
    badgeVariant?: "outline" | "secondary" | "destructive" | "default";
    badgeTrend?: "up" | "down";
    footerTrendText: string;
    footerSubtext: string;
}

const DEFAULT_CLINIC_CARDS: MetricCardItem[] = [
    {
        title: "Total Clinic Revenue",
        value: "$48,250.00",
        badgeText: "+14.5%",
        badgeTrend: "up",
        footerTrendText: "Trending up this month",
        footerSubtext: "Consultations & procedure billings",
    },
    {
        title: "New Appointments",
        value: "28",
        badgeText: "+18.2%",
        badgeTrend: "up",
        footerTrendText: "8 scheduled for today",
        footerSubtext: "Across all clinic specialists",
    },
    {
        title: "Active Patient Leads",
        value: "34",
        badgeText: "+9.4%",
        badgeTrend: "up",
        footerTrendText: "12 awaiting consultation",
        footerSubtext: "High conversion momentum",
    },
    {
        title: "Attendance Rate",
        value: "96.4%",
        badgeText: "+3.2%",
        badgeTrend: "up",
        footerTrendText: "Steady patient show-up",
        footerSubtext: "Low cancellation rate this month",
    },
];

export function SectionCards({
    items = DEFAULT_CLINIC_CARDS,
    className,
}: {
    items?: MetricCardItem[];
    className?: string;
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
                "*:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card",
                "px-4 lg:px-6",
                className
            )}
        >
            {items.map((card) => (
                <Card className="@container/card" key={card.title}>
                    <CardHeader>
                        <CardDescription>{card.title}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {card.value}
                        </CardTitle>
                        <CardAction>
                            <Badge variant={card.badgeVariant ?? "outline"}>
                                {card.badgeTrend === "down" ? (
                                    <TrendingDownIcon className="size-3 mr-1" />
                                ) : (
                                    <TrendingUpIcon className="size-3 mr-1" />
                                )}
                                {card.badgeText}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {card.footerTrendText}{" "}
                            {card.badgeTrend === "down" ? (
                                <TrendingDownIcon className="size-4" />
                            ) : (
                                <TrendingUpIcon className="size-4" />
                            )}
                        </div>
                        <div className="text-muted-foreground">
                            {card.footerSubtext}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
