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
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    Columns3Icon,
    EllipsisVerticalIcon,
    PlusIcon,
    ArrowUpDownIcon,
    UserCheckIcon,
    IndianRupeeIcon,
    CalendarCheckIcon,
    UsersIcon,
    ExternalLinkIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCards, type MetricCardItem } from "@/components/section-cards";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { AddLeadDialog } from "@/components/add-lead-dialog";
import Layout from "../layout/Layout";
import type { Lead, LeadFormField, LeadPriority, LeadStatus } from "@/types/lead";

const features = tableFeatures({
    columnFilteringFeature,
    columnVisibilityFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Lead>();

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

const columns = columnHelper.columns([
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
                    aria-label="Select all leads"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select lead row"
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
                Patient / Lead
                <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => {
            const lead = row.original;
            return (
                <div className="flex flex-col gap-0.5 py-0.5">
                    <Link
                        href={`/leads/${lead.id}`}
                        prefetch
                        className="font-medium text-foreground hover:underline transition-colors hover:text-primary flex items-center gap-1.5"
                    >
                        <span>{lead.name}</span>
                        <ExternalLinkIcon className="size-3 text-muted-foreground/60 opacity-0 group-hover/row:opacity-100" />
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                        {lead.email}
                    </span>
                </div>
            );
        },
        enableHiding: false,
    }),
    columnHelper.accessor("service", {
        header: "Procedure / Service",
        cell: ({ row }) => (
            <div className="font-normal text-slate-800 dark:text-slate-200">
                {row.original.service}
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-medium hover:bg-transparent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Status
                <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
            </Button>
        ),
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
                    Total Value
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
            <div className="text-xs text-muted-foreground">
                {row.original.doctor}
            </div>
        ),
    }),
    columnHelper.accessor("createdAt", {
        header: "Date Added",
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground">
                {row.original.createdAt}
            </div>
        ),
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
            const lead = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                            />
                        }
                    >
                        <EllipsisVerticalIcon className="size-4" />
                        <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                            render={
                                <Link href={`/leads/${lead.id}`} prefetch />
                            }
                        >
                            View Lead Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            render={<Link href="/pipeline" prefetch />}
                        >
                            View in Pipeline
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                alert(
                                    `Contacting ${lead.name} (${lead.phone})`,
                                );
                            }}
                        >
                            Call Patient
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
]);

export default function LeadsPage({
    leads: initialLeads,
    customFields,
}: {
    leads: Lead[];
    customFields?: LeadFormField[];
}) {
    const [data, setData] = React.useState<Lead[]>(() => initialLeads || []);
    const [isAddLeadOpen, setIsAddLeadOpen] = React.useState(false);
    React.useEffect(() => {
        setData(initialLeads || []);
    }, [initialLeads]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("ALL");

    // Compute stats
    const totalLeads = data.length;
    const totalPipelineValue = data.reduce((acc, lead) => acc + lead.value, 0);
    const scheduledCount = data.filter(
        (l) => l.status === "Consultation Scheduled",
    ).length;
    const wonCount = data.filter((l) => l.status === "Won").length;

    // Filter data based on search and status
    const filteredData = React.useMemo(() => {
        let result = data;

        if (statusFilter !== "ALL") {
            result = result.filter((lead) => lead.status === statusFilter);
        }

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(q) ||
                    lead.email.toLowerCase().includes(q) ||
                    lead.service.toLowerCase().includes(q) ||
                    lead.doctor.toLowerCase().includes(q),
            );
        }

        return result;
    }, [data, searchQuery, statusFilter]);

    const table = useTable({
        features,
        data: filteredData,
        columns,
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

    const leadsMetricCards: MetricCardItem[] = React.useMemo(
        () => [
            {
                title: "Total Leads",
                value: `${totalLeads} Leads`,
                badgeText: "+12.5%",
                badgeTrend: "up",
                footerTrendText: "Steady patient inquiries",
                footerSubtext: "All registered clinic prospects",
            },
            {
                title: "Active Pipeline Value",
                value: `₹${totalPipelineValue.toLocaleString()}`,
                badgeText: "+10.8%",
                badgeTrend: "up",
                footerTrendText: "Total procedure revenue",
                footerSubtext: "Across all clinical specialties",
            },
            {
                title: "Scheduled Consultations",
                value: `${scheduledCount}`,
                badgeText: "+20.0%",
                badgeTrend: "up",
                footerTrendText: "3 confirmed for this week",
                footerSubtext: "Doctor consultations booked",
            },
            {
                title: "Won Patients",
                value: `${wonCount}`,
                badgeText: "+15.0%",
                badgeTrend: "up",
                footerTrendText: "High patient enrollment",
                footerSubtext: "Treatment plans accepted",
            },
        ],
        [totalLeads, totalPipelineValue, scheduledCount, wonCount],
    );

    return (
        <Layout title="All Leads">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Page Title & Intro */}
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-medium font-sans tracking-tight text-foreground lg:text-4xl">
                            Leads Management
                        </h1>
                        <p className="mt-1 text-sm font-sans tracking-tight text-muted-foreground">
                            Manage patient inquiries, consultation bookings, and
                            clinic treatment leads.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            render={<Link href="/pipeline" prefetch />}
                        >
                            View Pipeline Board
                        </Button>
                        <Button
                            onClick={() => setIsAddLeadOpen(true)}
                            className="bg-primary text-primary-foreground cursor-pointer"
                        >
                            <PlusIcon className="size-4" />
                            <span>Add New Lead</span>
                        </Button>
                    </div>
                </div>

                <AddLeadDialog
                    open={isAddLeadOpen}
                    onOpenChange={setIsAddLeadOpen}
                    customFields={customFields}
                    onSuccess={(newLead) => {
                        setData((prev) => [newLead, ...prev]);
                    }}
                />

                {/* Metrics Cards */}
                <SectionCards
                    items={leadsMetricCards}
                    className="px-0 lg:px-0"
                />

                {/* TanStack Table Section */}
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative w-full max-w-sm">
                                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, service..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9 text-xs h-9"
                                />
                            </div>

                            <Select
                                value={statusFilter}
                                onValueChange={(val) =>
                                    setStatusFilter(val ?? "ALL")
                                }
                            >
                                <SelectTrigger className="w-44 h-9">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="ALL">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Contacted">
                                            Contacted
                                        </SelectItem>
                                        <SelectItem value="Consultation Scheduled">
                                            Consultation Scheduled
                                        </SelectItem>
                                        <SelectItem value="Treatment Plan Sent">
                                            Treatment Plan Sent
                                        </SelectItem>
                                        <SelectItem value="Won">Won</SelectItem>
                                        <SelectItem value="Lost">
                                            Lost
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Columns Visibility */}
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9"
                                        />
                                    }
                                >
                                    <Columns3Icon className="size-4 mr-1.5" />
                                    Columns
                                    <ChevronDownIcon className="size-3.5 ml-1.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-44"
                                >
                                    {table
                                        .getAllColumns()
                                        .filter(
                                            (column) =>
                                                typeof column.accessorFn !==
                                                    "undefined" &&
                                                column.getCanHide(),
                                        )
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize text-xs"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(
                                                        !!value,
                                                    )
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader className="bg-muted/60">
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
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                            className="group/row hover:bg-muted/40 transition-colors"
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
                                            colSpan={columns.length}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No clinical leads match your search
                                            criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Table Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
                        <div className="text-xs text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} lead(s)
                            selected.
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Rows per page:
                                </span>
                                <Select
                                    value={`${table.state.pagination.pageSize}`}
                                    onValueChange={(val) =>
                                        table.setPageSize(Number(val))
                                    }
                                >
                                    <SelectTrigger className="h-8 w-16">
                                        <SelectValue
                                            placeholder={
                                                table.state.pagination.pageSize
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        <SelectGroup>
                                            {[5, 10, 20, 50].map((sz) => (
                                                <SelectItem
                                                    key={sz}
                                                    value={`${sz}`}
                                                >
                                                    {sz}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-xs font-medium">
                                Page {table.state.pagination.pageIndex + 1} of{" "}
                                {Math.max(1, table.getPageCount())}
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronsLeftIcon className="size-4" />
                                    <span className="sr-only">First page</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeftIcon className="size-4" />
                                    <span className="sr-only">
                                        Previous page
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRightIcon className="size-4" />
                                    <span className="sr-only">Next page</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() =>
                                        table.setPageIndex(
                                            table.getPageCount() - 1,
                                        )
                                    }
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronsRightIcon className="size-4" />
                                    <span className="sr-only">Last page</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
