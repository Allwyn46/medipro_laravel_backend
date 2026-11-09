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
    rowSelectionFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
    type ColumnFiltersState,
    type ColumnVisibilityState,
    type SortingState,
} from "@tanstack/react-table";
import {
    SearchIcon,
    ArrowUpDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    KanbanIcon,
    TablePropertiesIcon,
    IndianRupeeIcon,
    UsersIcon,
    CalendarCheckIcon,
    TrophyIcon,
    ExternalLinkIcon,
    PhoneIcon,
    ChevronDownIcon,
    Columns3Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCards, type MetricCardItem } from "@/components/section-cards";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "./layout/Layout";
import type { Lead, LeadPriority, LeadStatus } from "@/types/lead";

const STAGES: { status: LeadStatus; label: string; headerColor: string; dotColor: string }[] = [
    {
        status: "New",
        label: "New Inquiries",
        headerColor: "border-t-blue-500",
        dotColor: "bg-blue-500",
    },
    {
        status: "Contacted",
        label: "Contacted",
        headerColor: "border-t-amber-500",
        dotColor: "bg-amber-500",
    },
    {
        status: "Consultation Scheduled",
        label: "Consultation Booked",
        headerColor: "border-t-purple-500",
        dotColor: "bg-purple-500",
    },
    {
        status: "Treatment Plan Sent",
        label: "Treatment Plan Sent",
        headerColor: "border-t-indigo-500",
        dotColor: "bg-indigo-500",
    },
    {
        status: "Won",
        label: "Won / In Treatment",
        headerColor: "border-t-emerald-500",
        dotColor: "bg-emerald-500",
    },
    {
        status: "Lost",
        label: "Lost / Closed",
        headerColor: "border-t-zinc-400",
        dotColor: "bg-zinc-400",
    },
];

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

const tableFeaturesConfig = tableFeatures({
    columnFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof tableFeaturesConfig, Lead>();

const pipelineColumns = columnHelper.columns([
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={
                        table.getIsSomePageRowsSelected() &&
                        !table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all pipeline rows"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select pipeline row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    }),
    columnHelper.accessor("name", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-medium hover:bg-transparent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Patient
                <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => (
            <Link
                href={`/leads/${row.original.id}`}
                prefetch
                className="font-medium text-foreground hover:underline hover:text-primary flex items-center gap-1.5"
            >
                <span>{row.original.name}</span>
                <ExternalLinkIcon className="size-3 text-muted-foreground" />
            </Link>
        ),
    }),
    columnHelper.accessor("service", {
        header: "Procedure",
        cell: ({ row }) => (
            <span className="text-xs">{row.original.service}</span>
        ),
    }),
    columnHelper.accessor("status", {
        header: "Pipeline Stage",
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={`font-medium ${getStatusBadgeClass(row.original.status)}`}
            >
                {row.original.status}
            </Badge>
        ),
    }),
    columnHelper.accessor("priority", {
        header: "Priority",
        cell: ({ row }) => (
            <Badge variant={getPriorityBadgeVariant(row.original.priority)}>
                {row.original.priority}
            </Badge>
        ),
    }),
    columnHelper.accessor("value", {
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3 h-8 text-xs font-medium hover:bg-transparent"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Value
                    <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
                </Button>
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right font-medium tabular-nums text-foreground">
                ₹{row.original.value.toLocaleString()}
            </div>
        ),
    }),
    columnHelper.accessor("doctor", {
        header: "Specialist",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
                {row.original.doctor}
            </span>
        ),
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                render={<Link href={`/leads/${row.original.id}`} prefetch />}
            >
                Details
            </Button>
        ),
    }),
]);

export default function PipelinePage({
    leads: initialLeads,
}: {
    leads: Lead[];
}) {
    const [leads, setLeads] = React.useState<Lead[]>(() => initialLeads || []);
    React.useEffect(() => {
        setLeads(initialLeads || []);
    }, [initialLeads]);
    const [searchQuery, setSearchQuery] = React.useState("");

    // TanStack Table state
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "value", desc: true },
    ]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Filter leads
    const filteredLeads = React.useMemo(() => {
        if (!searchQuery.trim()) return leads;
        const q = searchQuery.toLowerCase();
        return leads.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.service.toLowerCase().includes(q) ||
                l.doctor.toLowerCase().includes(q)
        );
    }, [leads, searchQuery]);

    // Compute metrics
    const totalPipelineValue = leads.reduce((acc, l) => acc + l.value, 0);
    const wonValue = leads
        .filter((l) => l.status === "Won")
        .reduce((acc, l) => acc + l.value, 0);
    const scheduledConsultations = leads.filter(
        (l) => l.status === "Consultation Scheduled"
    ).length;

    // TanStack Table initialization
    const table = useTable({
        features: tableFeaturesConfig,
        data: filteredLeads,
        columns: pipelineColumns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
    });

    const pipelineMetricCards: MetricCardItem[] = React.useMemo(
        () => [
            {
                title: "Total In Pipeline",
                value: `${leads.length} Leads`,
                badgeText: "+8.3%",
                badgeTrend: "up",
                footerTrendText: "4 new inquiries this week",
                footerSubtext: "Active across all pipeline stages",
            },
            {
                title: "Pipeline Total Value",
                value: `₹${totalPipelineValue.toLocaleString()}`,
                badgeText: "+14.2%",
                badgeTrend: "up",
                footerTrendText: "High-value procedure plans",
                footerSubtext: "Projected clinical revenue",
            },
            {
                title: "Consultations Booked",
                value: `${scheduledConsultations}`,
                badgeText: "+25.0%",
                badgeTrend: "up",
                footerTrendText: "3 sessions upcoming this week",
                footerSubtext: "Confirmed specialist visits",
            },
            {
                title: "Won Treatments Value",
                value: `₹${wonValue.toLocaleString()}`,
                badgeText: "+16.5%",
                badgeTrend: "up",
                footerTrendText: "Steady patient conversion",
                footerSubtext: "Enrolled in active treatment",
            },
        ],
        [leads.length, totalPipelineValue, scheduledConsultations, wonValue]
    );

    return (
        <Layout title="Pipeline">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-medium font-sans tracking-tight text-foreground lg:text-4xl">
                            Clinical Pipeline
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track and advance leads across consultation, planning, and treatment stages.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            render={<Link href="/leads" prefetch />}
                        >
                            View All Leads Table
                        </Button>
                    </div>
                </div>

                {/* Pipeline Stats */}
                <SectionCards
                    items={pipelineMetricCards}
                    className="px-0 lg:px-0"
                />

                {/* Tabs: Kanban Board View vs Table View (both interactive) */}
                <Tabs defaultValue="board" className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <TabsList>
                            <TabsTrigger value="board" className="gap-1.5">
                                <KanbanIcon className="size-4" />
                                <span>Board View</span>
                            </TabsTrigger>
                            <TabsTrigger value="table" className="gap-1.5">
                                <TablePropertiesIcon className="size-4" />
                                <span>TanStack Table</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full max-w-xs">
                            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter pipeline leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 text-xs h-9"
                            />
                        </div>
                    </div>

                    {/* Kanban Board View */}
                    <TabsContent value="board" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
                            {STAGES.map((stage) => {
                                const stageLeads = filteredLeads.filter(
                                    (l) => l.status === stage.status
                                );
                                const stageTotal = stageLeads.reduce(
                                    (acc, l) => acc + l.value,
                                    0
                                );

                                return (
                                    <div
                                        key={stage.status}
                                        className={`flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 border-t-4 ${stage.headerColor}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`size-2 rounded-full ${stage.dotColor}`}
                                                />
                                                <span className="font-semibold text-xs text-foreground truncate">
                                                    {stage.label}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] px-1.5 py-0"
                                            >
                                                {stageLeads.length}
                                            </Badge>
                                        </div>

                                        <div className="text-[11px] text-muted-foreground tabular-nums">
                                            ₹{stageTotal.toLocaleString()} total
                                        </div>

                                        {/* Cards list */}
                                        <div className="flex flex-col gap-2.5 min-h-[160px]">
                                            {stageLeads.map((lead) => (
                                                <div
                                                    key={lead.id}
                                                    className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between gap-1">
                                                        <Link
                                                            href={`/leads/${lead.id}`}
                                                            prefetch
                                                            className="font-medium text-xs text-foreground hover:underline hover:text-primary leading-tight line-clamp-1"
                                                        >
                                                            {lead.name}
                                                        </Link>
                                                        <Badge
                                                            variant={getPriorityBadgeVariant(
                                                                lead.priority
                                                            )}
                                                            className="text-[9px] px-1 py-0 shrink-0"
                                                        >
                                                            {lead.priority}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                                                        {lead.service}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                                                        <span className="font-bold text-foreground tabular-nums">
                                                            ₹{lead.value.toLocaleString()}
                                                        </span>
                                                        <span className="text-muted-foreground truncate max-w-[90px]">
                                                            {lead.doctor.replace("Dr. ", "")}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1">
                                                        <Link
                                                            href={`/leads/${lead.id}`}
                                                            prefetch
                                                            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                                                        >
                                                            View Lead
                                                            <ChevronRightIcon className="size-3" />
                                                        </Link>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {lead.createdAt.substring(5)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {stageLeads.length === 0 && (
                                                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                                                    No leads in stage
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* TanStack Table View */}
                    <TabsContent value="table" className="mt-0">
                        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Displaying {filteredLeads.length} leads in pipeline
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={<Button variant="outline" size="sm" className="h-8 text-xs" />}
                                    >
                                        <Columns3Icon className="size-3.5 mr-1.5" />
                                        Columns
                                        <ChevronDownIcon className="size-3 ml-1 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        {table
                                            .getAllColumns()
                                            .filter(
                                                (column) =>
                                                    typeof column.accessorFn !==
                                                        "undefined" &&
                                                    column.getCanHide()
                                            )
                                            .map((column) => (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize text-xs"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead
                                                        key={header.id}
                                                        colSpan={header.colSpan}
                                                        className="text-xs font-semibold text-foreground/80"
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <FlexRender
                                                                header={header}
                                                            />
                                                        )}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    data-state={
                                                        row.getIsSelected() && "selected"
                                                    }
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className="py-3 text-xs"
                                                        >
                                                            <FlexRender cell={cell} />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={pipelineColumns.length}
                                                    className="h-28 text-center text-muted-foreground"
                                                >
                                                    No leads found in pipeline.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
                                <div className="text-xs text-muted-foreground">
                                    Page {table.state.pagination.pageIndex + 1} of{" "}
                                    {Math.max(1, table.getPageCount())}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <ChevronLeftIcon className="size-3.5 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                        <ChevronRightIcon className="size-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
