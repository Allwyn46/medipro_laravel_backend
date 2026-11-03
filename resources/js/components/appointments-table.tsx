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
    Columns3Icon,
    EllipsisVerticalIcon,
    PlusIcon,
    ArrowUpDownIcon,
    CalendarIcon,
    ClockIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    CheckCircle2Icon,
    UserCheckIcon,
    ExternalLinkIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/types/appointment";
import { INITIAL_APPOINTMENTS } from "@/types/appointment";

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

const columnHelper = createColumnHelper<typeof features, Appointment>();

function getStatusBadgeClass(status: AppointmentStatus) {
    switch (status) {
        case "Confirmed":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "In Progress":
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
        case "Scheduled":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        case "Completed":
            return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
        case "Cancelled":
            return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    }
}

function getTypeBadgeVariant(type: AppointmentType) {
    switch (type) {
        case "Initial Consultation":
            return "outline" as const;
        case "Procedure":
            return "default" as const;
        case "Follow-up":
            return "secondary" as const;
        case "Health Check":
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
                    aria-label="Select all appointments"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select appointment row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    }),
    columnHelper.accessor("time", {
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-xs font-medium hover:bg-transparent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Time & Slot
                <ArrowUpDownIcon className="ml-1 size-3 text-muted-foreground" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs tabular-nums">
                    <ClockIcon className="size-3 text-muted-foreground" />
                    <span>{row.original.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">{row.original.date}</span>
                    <span>•</span>
                    <span>{row.original.duration}</span>
                </div>
            </div>
        ),
        enableHiding: false,
    }),
    columnHelper.accessor("patientName", {
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
        cell: ({ row }) => {
            const apt = row.original;
            return (
                <div className="flex flex-col gap-0.5">
                    {apt.leadId ? (
                        <Link
                            href={`/leads/${apt.leadId}`}
                            prefetch
                            className="font-medium text-foreground hover:underline hover:text-primary flex items-center gap-1.5 transition-colors"
                        >
                            <span>{apt.patientName}</span>
                            <ExternalLinkIcon className="size-3 text-muted-foreground/60" />
                        </Link>
                    ) : (
                        <span className="font-medium text-foreground">
                            {apt.patientName}
                        </span>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{apt.patientPhone}</span>
                    </div>
                </div>
            );
        },
    }),
    columnHelper.accessor("service", {
        header: "Procedure / Treatment",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {row.original.service}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="size-3" />
                    {row.original.room}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("doctor", {
        header: "Specialist",
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground font-medium">
                {row.original.doctor}
            </div>
        ),
    }),
    columnHelper.accessor("type", {
        header: "Type",
        cell: ({ row }) => (
            <Badge
                variant={getTypeBadgeVariant(row.original.type)}
                className="text-[10px] font-normal"
            >
                {row.original.type}
            </Badge>
        ),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    variant="outline"
                    className={`font-medium ${getStatusBadgeClass(status)}`}
                >
                    {status === "In Progress" && (
                        <span className="size-1.5 rounded-full bg-blue-500 animate-pulse mr-1" />
                    )}
                    {status === "Confirmed" && (
                        <CheckCircle2Icon className="size-3 mr-1 text-emerald-500" />
                    )}
                    {status}
                </Badge>
            );
        },
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
            const apt = row.original;
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
                        <span className="sr-only">Appointment options</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {apt.leadId && (
                            <DropdownMenuItem
                                render={<Link href={`/leads/${apt.leadId}`} prefetch />}
                            >
                                View Patient Lead
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() => {
                                alert(`Checking in ${apt.patientName}`);
                            }}
                        >
                            Patient Check-In
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                alert(`Calling ${apt.patientName} at ${apt.patientPhone}`);
                            }}
                        >
                            Call Patient
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                alert(`Rescheduling appointment for ${apt.patientName}`);
                            }}
                        >
                            Reschedule Slot
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
]);

export function AppointmentsTable({
    appointments = INITIAL_APPOINTMENTS,
}: {
    appointments?: Appointment[];
}) {
    const [data, setData] = React.useState<Appointment[]>(appointments);
    const [tabFilter, setTabFilter] = React.useState<"all" | "today" | "tomorrow">("all");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [doctorFilter, setDoctorFilter] = React.useState("ALL");

    // TanStack table state
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const filteredData = React.useMemo(() => {
        let result = data;

        if (tabFilter === "today") {
            result = result.filter((a) => a.date === "Today");
        } else if (tabFilter === "tomorrow") {
            result = result.filter((a) => a.date === "Tomorrow");
        }

        if (doctorFilter !== "ALL") {
            result = result.filter((a) => a.doctor === doctorFilter);
        }

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (a) =>
                    a.patientName.toLowerCase().includes(q) ||
                    a.service.toLowerCase().includes(q) ||
                    a.doctor.toLowerCase().includes(q) ||
                    a.room.toLowerCase().includes(q)
            );
        }

        return result;
    }, [data, tabFilter, doctorFilter, searchQuery]);

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

    return (
        <div className="flex flex-col gap-4 px-4 lg:px-6">
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
                {/* Header title & controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <CalendarIcon className="size-5 text-primary" />
                            New Appointments & Daily Schedule
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Real-time schedule of patient consultations, clinical procedures, and specialist bookings.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/leads" prefetch />}
                        >
                            View All Leads
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/pipeline" prefetch />}
                        >
                            View Pipeline
                        </Button>
                        <Button
                            size="sm"
                            className="bg-primary text-primary-foreground"
                            onClick={() => alert("Open New Booking Modal")}
                        >
                            <PlusIcon className="size-4 mr-1" />
                            Book Appointment
                        </Button>
                    </div>
                </div>

                {/* Filter and Tab Bar */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs
                        value={tabFilter}
                        onValueChange={(val) => setTabFilter(val as any)}
                        className="w-fit"
                    >
                        <TabsList className="h-9">
                            <TabsTrigger value="all" className="text-xs">
                                All ({data.length})
                            </TabsTrigger>
                            <TabsTrigger value="today" className="text-xs">
                                Today ({data.filter((a) => a.date === "Today").length})
                            </TabsTrigger>
                            <TabsTrigger value="tomorrow" className="text-xs">
                                Tomorrow ({data.filter((a) => a.date === "Tomorrow").length})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search patient, procedure, room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 text-xs h-9"
                            />
                        </div>

                        <Select
                            value={doctorFilter}
                            onValueChange={(val) => setDoctorFilter(val ?? "ALL")}
                        >
                            <SelectTrigger className="w-44 h-9 text-xs">
                                <SelectValue placeholder="All Doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="ALL">All Doctors</SelectItem>
                                    <SelectItem value="Dr. Eddie Lake">Dr. Eddie Lake</SelectItem>
                                    <SelectItem value="Dr. Jamik Tashpulatov">
                                        Dr. Jamik Tashpulatov
                                    </SelectItem>
                                    <SelectItem value="Dr. Emily Whalen">
                                        Dr. Emily Whalen
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={<Button variant="outline" size="sm" className="h-9 text-xs" />}
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
                </div>

                {/* TanStack Table View */}
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="text-xs font-semibold text-foreground/80 py-2.5"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <FlexRender header={header} />
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
                                        colSpan={columns.length}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        No appointments scheduled matching current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1">
                    <div className="text-xs text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} appointment(s) selected.
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs font-medium">
                            Page {table.state.pagination.pageIndex + 1} of{" "}
                            {Math.max(1, table.getPageCount())}
                        </div>

                        <div className="flex items-center gap-1">
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
            </div>
        </div>
    );
}
