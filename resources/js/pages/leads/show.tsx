import * as React from "react";
import { Link } from "@inertiajs/react";
import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createColumnHelper,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    FlexRender,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
    type SortingState,
} from "@tanstack/react-table";
import {
    ArrowLeftIcon,
    PhoneIcon,
    MailIcon,
    CalendarIcon,
    UserIcon,
    IndianRupeeIcon,
    TagIcon,
    ClockIcon,
    PlusIcon,
    ArrowUpDownIcon,
    CheckCircle2Icon,
    Share2Icon,
    FileTextIcon,
    ActivityIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    StethoscopeIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Layout from "../layout/Layout";
import type { Lead, LeadActivity, LeadPriority, LeadStatus } from "@/types/lead";

function getStatusBadgeClass(status: LeadStatus) {
    switch (status) {
        case "New":
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
        case "Contacted":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Consultation Scheduled":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        case "Treatment Plan Sent":
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
        case "Won":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "Lost":
            return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
        default:
            return "";
    }
}

function getPriorityBadgeVariant(priority: LeadPriority) {
    switch (priority) {
        case "High":
            return "destructive" as const;
        case "Medium":
            return "secondary" as const;
        case "Low":
            return "outline" as const;
    }
}

function getActivityIcon(type: LeadActivity["type"]) {
    switch (type) {
        case "Call":
            return <PhoneIcon className="size-3.5 text-blue-500" />;
        case "Email":
            return <MailIcon className="size-3.5 text-purple-500" />;
        case "Consultation":
            return <CalendarIcon className="size-3.5 text-emerald-500" />;
        case "Note":
            return <FileTextIcon className="size-3.5 text-amber-500" />;
        case "Status Change":
            return <ActivityIcon className="size-3.5 text-indigo-500" />;
    }
}

const activityFeatures = tableFeatures({
    columnFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof activityFeatures, LeadActivity>();

const activityColumns = columnHelper.columns([
    columnHelper.accessor("type", {
        header: "Type",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5">
                {getActivityIcon(row.original.type)}
                <span className="font-medium text-xs text-foreground">
                    {row.original.type}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("title", {
        header: "Activity & Details",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                    {row.original.title}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                    {row.original.description}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("doctor", {
        header: "Staff / Doctor",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
                {row.original.doctor || "General Staff"}
            </span>
        ),
    }),
    columnHelper.accessor("date", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-medium hover:bg-transparent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Timestamp
                <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground tabular-nums">
                {row.original.date}
            </span>
        ),
    }),
]);

export default function SingleLeadPage({
    lead,
    allLeads = [],
}: {
    lead: Lead;
    allLeads?: Lead[];
}) {
    const [currentStatus, setCurrentStatus] = React.useState<LeadStatus>(
        lead.status
    );
    const [activities, setActivities] = React.useState<LeadActivity[]>(
        () => lead.activities || []
    );
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "date", desc: true },
    ]);
    const [newNote, setNewNote] = React.useState("");

    // Find next / previous leads for navigation
    const currentIndex = allLeads.findIndex((l) => l.id === lead.id);
    const prevLead = currentIndex > 0 ? allLeads[currentIndex - 1] : null;
    const nextLead =
        currentIndex >= 0 && currentIndex < allLeads.length - 1
            ? allLeads[currentIndex + 1]
            : null;

    const table = useTable({
        features: activityFeatures,
        data: activities,
        columns: activityColumns,
        state: {
            sorting,
        },
        getRowId: (row) => row.id.toString(),
        onSortingChange: setSorting,
    });

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        const activity: LeadActivity = {
            id: Date.now(),
            type: "Note",
            title: "Staff Clinical Note",
            description: newNote.trim(),
            doctor: "Current Specialist",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
        };

        setActivities([activity, ...activities]);
        setNewNote("");
    };

    const handleStatusChange = (status: LeadStatus) => {
        setCurrentStatus(status);
        const changeActivity: LeadActivity = {
            id: Date.now(),
            type: "Status Change",
            title: `Status Changed to ${status}`,
            description: `Lead status updated in clinic pipeline.`,
            doctor: "Staff System",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
        };
        setActivities([changeActivity, ...activities]);
    };

    return (
        <Layout title={`Lead - ${lead.name}`}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Navigation Breadcrumbs / Back Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href="/leads" prefetch />}
                            className="text-xs text-muted-foreground hover:text-foreground -ml-2"
                        >
                            <ArrowLeftIcon className="size-4 mr-1.5" />
                            Back to All Leads
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs text-muted-foreground">
                            Lead #{lead.id}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {prevLead && (
                            <Button
                                variant="outline"
                                size="sm"
                                render={
                                    <Link
                                        href={`/leads/${prevLead.id}`}
                                        prefetch
                                    />
                                }
                                title={`Previous: ${prevLead.name}`}
                            >
                                <ChevronLeftIcon className="size-4 mr-1" />
                                Previous
                            </Button>
                        )}
                        {nextLead && (
                            <Button
                                variant="outline"
                                size="sm"
                                render={
                                    <Link
                                        href={`/leads/${nextLead.id}`}
                                        prefetch
                                    />
                                }
                                title={`Next: ${nextLead.name}`}
                            >
                                Next
                                <ChevronRightIcon className="size-4 ml-1" />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/pipeline" prefetch />}
                        >
                            View Pipeline
                        </Button>
                    </div>
                </div>

                {/* Lead Profile Header */}
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                            {lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {lead.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`font-medium ${getStatusBadgeClass(currentStatus)}`}
                                >
                                    {currentStatus}
                                </Badge>
                                <Badge
                                    variant={getPriorityBadgeVariant(
                                        lead.priority
                                    )}
                                >
                                    {lead.priority} Priority
                                </Badge>
                            </div>
                            <p className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MailIcon className="size-3.5" />
                                    {lead.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <PhoneIcon className="size-3.5" />
                                    {lead.phone}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClockIcon className="size-3.5" />
                                    Added on {lead.createdAt}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Switcher Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="sm">
                                        Status: {currentStatus}
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-48">
                                {(
                                    [
                                        "New",
                                        "Contacted",
                                        "Consultation Scheduled",
                                        "Treatment Plan Sent",
                                        "Won",
                                        "Lost",
                                    ] as LeadStatus[]
                                ).map((st) => (
                                    <DropdownMenuItem
                                        key={st}
                                        onClick={() => handleStatusChange(st)}
                                        className="text-xs"
                                    >
                                        <Badge
                                            variant="outline"
                                            className={`mr-2 ${getStatusBadgeClass(st)}`}
                                        >
                                            {st}
                                        </Badge>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            size="sm"
                            className="bg-primary text-primary-foreground"
                            onClick={() => {
                                alert(`Calling patient at ${lead.phone}`);
                            }}
                        >
                            <PhoneIcon className="size-3.5 mr-1.5" />
                            Call Patient
                        </Button>
                    </div>
                </div>

                {/* Main Two-Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Lead Overview Details */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        {/* Clinical Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Clinical Overview
                                </CardTitle>
                                <CardDescription>
                                    Procedure details and expected treatment value.
                                </CardDescription>
                            </CardHeader>
                            <div className="flex flex-col gap-3 px-4 pb-4 text-xs">
                                <div className="flex items-center justify-between py-1 border-b">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <StethoscopeIcon className="size-4" />
                                        Interested Service
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {lead.service}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <IndianRupeeIcon className="size-4" />
                                        Estimated Value
                                    </span>
                                    <span className="font-bold text-foreground text-sm tabular-nums">
                                        ₹{lead.value.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <UserIcon className="size-4" />
                                        Assigned Doctor
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {lead.doctor}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Share2Icon className="size-4" />
                                        Referral Source
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {lead.source}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <ClockIcon className="size-4" />
                                        Last Contact Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {lead.lastContactDate}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Patient Notes Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Patient Clinical Notes
                                </CardTitle>
                                <CardDescription>
                                    Internal observations and preferences.
                                </CardDescription>
                            </CardHeader>
                            <div className="flex flex-col gap-3 px-4 pb-4">
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/40 p-3 rounded-lg border">
                                    {lead.notes || "No additional notes provided."}
                                </p>

                                <form onSubmit={handleAddNote} className="flex flex-col gap-2 pt-2">
                                    <Input
                                        placeholder="Add quick clinical note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                        className="self-end text-xs"
                                        disabled={!newNote.trim()}
                                    >
                                        <PlusIcon className="size-3 mr-1" />
                                        Save Note
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: TanStack Table for Activities & Consultations */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                        Activity & Consultation History
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Full record of calls, emails, and consultation milestones (powered by TanStack Table).
                                    </p>
                                </div>
                                <Badge variant="secondary" className="w-fit">
                                    {activities.length} Events
                                </Badge>
                            </div>

                            {/* TanStack Table */}
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        {table
                                            .getHeaderGroups()
                                            .map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map(
                                                        (header) => (
                                                            <TableHead
                                                                key={header.id}
                                                                className="text-xs font-semibold text-foreground/80 py-2.5"
                                                            >
                                                                {header.isPlaceholder ? null : (
                                                                    <FlexRender
                                                                        header={
                                                                            header
                                                                        }
                                                                    />
                                                                )}
                                                            </TableHead>
                                                        )
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    {row
                                                        .getVisibleCells()
                                                        .map((cell) => (
                                                            <TableCell
                                                                key={cell.id}
                                                                className="py-3 text-xs"
                                                            >
                                                                <FlexRender
                                                                    cell={cell}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        activityColumns.length
                                                    }
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No activity logged yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
