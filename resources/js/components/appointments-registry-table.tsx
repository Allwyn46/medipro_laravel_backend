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
    type ColumnVisibilityState,
    type SortingState,
} from "@tanstack/react-table";
import {
    SearchIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Columns3Icon,
    ArrowUpDownIcon,
    CalendarIcon,
    ClockIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    ExternalLinkIcon,
    FilterIcon,
    CheckIcon,
    RotateCcwIcon,
    CalendarRangeIcon,
    UserCheckIcon,
    StethoscopeIcon,
    FileTextIcon,
    EyeIcon,
    UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
import {
    isWithinDateRange,
    matchesDatePreset,
} from "@/lib/date-normalization";

const ALL_STATUSES: AppointmentStatus[] = [
    "Confirmed",
    "Scheduled",
    "In Progress",
    "Completed",
    "Awaiting Confirmation",
    "Pending",
    "Reschedule",
    "Cancelled",
];

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
        case "Pending":
        case "Awaiting Confirmation":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Reschedule":
            return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
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

interface DoctorOption {
    id: number;
    name: string;
    specialty: string;
    room?: string;
    email?: string;
    phone?: string;
}

interface AppointmentsRegistryTableProps {
    appointments: Appointment[];
    doctors?: DoctorOption[];
    isAdmin?: boolean;
    initialDoctorId?: number | null;
}

export function AppointmentsRegistryTable({
    appointments,
    doctors = [],
    isAdmin = false,
    initialDoctorId = null,
}: AppointmentsRegistryTableProps) {
    // Filter states
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedStatuses, setSelectedStatuses] = React.useState<AppointmentStatus[]>([]);
    const [datePreset, setDatePreset] = React.useState<
        "all" | "today" | "tomorrow" | "this_week" | "this_month" | "past" | "custom"
    >("all");
    const [customFromDate, setCustomFromDate] = React.useState("");
    const [customToDate, setCustomToDate] = React.useState("");
    const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>(
        initialDoctorId ? String(initialDoctorId) : "ALL",
    );

    // Table state
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "time", desc: false },
    ]);
    const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 15,
    });

    // Audit Drawer state
    const [inspectAppointment, setInspectAppointment] = React.useState<Appointment | null>(null);

    // Toggle a single status in the multi-status filter
    const toggleStatus = (status: AppointmentStatus) => {
        setSelectedStatuses((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status],
        );
    };

    // Quick status macros
    const setMacroNeedsAction = () => {
        setSelectedStatuses(["Pending", "Awaiting Confirmation"]);
    };

    const setMacroActiveSchedule = () => {
        setSelectedStatuses(["Confirmed", "Scheduled", "In Progress"]);
    };

    const clearAllStatuses = () => {
        setSelectedStatuses([]);
    };

    // Custom date range handlers
    const handleApplyCustomDates = (from: string, to: string) => {
        setCustomFromDate(from);
        setCustomToDate(to);
        if (from || to) {
            setDatePreset("custom");
        } else {
            setDatePreset("all");
        }
    };

    const clearCustomDateRange = () => {
        setCustomFromDate("");
        setCustomToDate("");
        setDatePreset("all");
    };

    const resetAllFilters = () => {
        setSearchQuery("");
        setSelectedStatuses([]);
        setDatePreset("all");
        setCustomFromDate("");
        setCustomToDate("");
        setSelectedDoctorId("ALL");
    };

    // Filter appointments
    const filteredData = React.useMemo(() => {
        return appointments.filter((apt) => {
            // Text Search
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const pName = (apt.patientName || apt.patient_name || "").toLowerCase();
                const pPhone = (apt.patientPhone || apt.patient_phone || "").toLowerCase();
                const pEmail = (apt.patientEmail || apt.patient_email || "").toLowerCase();
                const srv = (apt.service || "").toLowerCase();
                const doc = (apt.doctor || "").toLowerCase();
                const notes = (apt.notes || "").toLowerCase();

                const matchesQuery =
                    pName.includes(query) ||
                    pPhone.includes(query) ||
                    pEmail.includes(query) ||
                    srv.includes(query) ||
                    doc.includes(query) ||
                    notes.includes(query);

                if (!matchesQuery) return false;
            }

            // Multi-Status Filter
            if (selectedStatuses.length > 0) {
                if (!selectedStatuses.includes(apt.status)) {
                    return false;
                }
            }

            // Date Filter
            if (datePreset === "custom") {
                if (!isWithinDateRange(apt.date, customFromDate || null, customToDate || null)) {
                    return false;
                }
            } else if (datePreset !== "all") {
                if (!matchesDatePreset(apt.date, datePreset)) {
                    return false;
                }
            }

            // Doctor Filter (Admin)
            if (isAdmin && selectedDoctorId !== "ALL") {
                const targetDoc = doctors.find((d) => String(d.id) === selectedDoctorId);
                const docMatches =
                    (apt.doctor_id && String(apt.doctor_id) === selectedDoctorId) ||
                    (targetDoc && apt.doctor === targetDoc.name);

                if (!docMatches) return false;
            }

            return true;
        });
    }, [
        appointments,
        searchQuery,
        selectedStatuses,
        datePreset,
        customFromDate,
        customToDate,
        selectedDoctorId,
        isAdmin,
        doctors,
    ]);

    // Summary counts for preset pills
    const dateCounts = React.useMemo(() => {
        const counts = {
            all: appointments.length,
            today: 0,
            tomorrow: 0,
            this_week: 0,
            this_month: 0,
            past: 0,
        };

        appointments.forEach((apt) => {
            if (matchesDatePreset(apt.date, "today")) counts.today++;
            if (matchesDatePreset(apt.date, "tomorrow")) counts.tomorrow++;
            if (matchesDatePreset(apt.date, "this_week")) counts.this_week++;
            if (matchesDatePreset(apt.date, "this_month")) counts.this_month++;
            if (matchesDatePreset(apt.date, "past")) counts.past++;
        });

        return counts;
    }, [appointments]);

    // Table Columns Definition
    const columns = React.useMemo(
        () =>
            columnHelper.columns([
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
                                aria-label="Select all"
                            />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                aria-label="Select row"
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
                            Date & Time
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
                                <span className="font-medium text-foreground/80">
                                    {row.original.date}
                                </span>
                                {row.original.duration && (
                                    <>
                                        <span>•</span>
                                        <span>{row.original.duration}</span>
                                    </>
                                )}
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
                        const leadId = apt.leadId ?? apt.lead_id;
                        return (
                            <div className="flex flex-col gap-0.5">
                                {leadId ? (
                                    <Link
                                        href={`/leads/${leadId}`}
                                        prefetch
                                        className="font-medium text-foreground hover:underline hover:text-primary flex items-center gap-1.5 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span>{apt.patientName || apt.patient_name}</span>
                                        <ExternalLinkIcon className="size-3 text-muted-foreground/60" />
                                    </Link>
                                ) : (
                                    <span className="font-medium text-foreground">
                                        {apt.patientName || apt.patient_name}
                                    </span>
                                )}
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <span>{apt.patientPhone || apt.patient_phone}</span>
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
                            {row.original.room && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <MapPinIcon className="size-3" />
                                    {row.original.room}
                                </span>
                            )}
                        </div>
                    ),
                }),
                columnHelper.accessor("doctor", {
                    header: "Specialist",
                    cell: ({ row }) => {
                        const doc = row.original.doctor;
                        if (!doc || doc === "Unassigned") {
                            return (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-normal"
                                >
                                    Unassigned
                                </Badge>
                            );
                        }
                        return (
                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                <StethoscopeIcon className="size-3 text-muted-foreground/70" />
                                <span>{doc}</span>
                            </div>
                        );
                    },
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
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(status)}`}
                            >
                                {status}
                            </span>
                        );
                    },
                }),
                columnHelper.display({
                    id: "actions",
                    header: () => <div className="text-right">Actions</div>,
                    cell: ({ row }) => (
                        <div className="text-right">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectAppointment(row.original);
                                }}
                            >
                                <EyeIcon className="size-3" />
                                Details
                            </Button>
                        </div>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                }),
            ]),
        [],
    );

    const table = useTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        features,
    });

    const isFiltered =
        searchQuery.trim().length > 0 ||
        selectedStatuses.length > 0 ||
        datePreset !== "all" ||
        customFromDate !== "" ||
        customToDate !== "" ||
        selectedDoctorId !== "ALL";

    return (
        <div className="flex flex-col gap-4">
            {/* Top Toolbar: Date Presets & Custom Date Range */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card border rounded-xl p-3.5 shadow-xs">
                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                    <Tabs
                        value={datePreset}
                        onValueChange={(val) => {
                            setDatePreset(val as typeof datePreset);
                            if (val !== "custom") {
                                setCustomFromDate("");
                                setCustomToDate("");
                            }
                        }}
                    >
                        <TabsList className="bg-muted/70 p-0.5 h-8">
                            <TabsTrigger value="all" className="text-xs px-2.5 h-7">
                                All ({dateCounts.all})
                            </TabsTrigger>
                            <TabsTrigger value="today" className="text-xs px-2.5 h-7">
                                Today ({dateCounts.today})
                            </TabsTrigger>
                            <TabsTrigger value="tomorrow" className="text-xs px-2.5 h-7">
                                Tomorrow ({dateCounts.tomorrow})
                            </TabsTrigger>
                            <TabsTrigger value="this_week" className="text-xs px-2.5 h-7">
                                This Week ({dateCounts.this_week})
                            </TabsTrigger>
                            <TabsTrigger value="this_month" className="text-xs px-2.5 h-7">
                                This Month ({dateCounts.this_month})
                            </TabsTrigger>
                            <TabsTrigger value="past" className="text-xs px-2.5 h-7">
                                Past ({dateCounts.past})
                            </TabsTrigger>
                            {datePreset === "custom" && (
                                <TabsTrigger value="custom" className="text-xs px-2.5 h-7">
                                    Custom Range
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Custom Date Range Picker */}
                <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1 bg-background text-muted-foreground">
                        <CalendarRangeIcon className="size-3.5 text-foreground/70" />
                        <span className="font-medium text-foreground">Range:</span>
                        <input
                            type="date"
                            value={customFromDate}
                            onChange={(e) => handleApplyCustomDates(e.target.value, customToDate)}
                            className="bg-transparent text-foreground focus:outline-hidden text-xs cursor-pointer"
                            placeholder="From"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                            type="date"
                            value={customToDate}
                            onChange={(e) => handleApplyCustomDates(customFromDate, e.target.value)}
                            className="bg-transparent text-foreground focus:outline-hidden text-xs cursor-pointer"
                            placeholder="To"
                        />
                    </div>
                    {(customFromDate || customToDate) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={clearCustomDateRange}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Second Toolbar: Search, Multi-Status Popover, Specialist Dropdown, Column Visibility */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patient, phone, procedure, notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-xs h-9"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Multi-Status Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 text-xs gap-1.5 ${selectedStatuses.length > 0 ? "border-primary text-primary" : ""}`}
                                />
                            }
                        >
                            <FilterIcon className="size-3.5" />
                            <span>
                                {selectedStatuses.length === 0
                                    ? "All Statuses"
                                    : `Status (${selectedStatuses.length})`}
                            </span>
                            <ChevronDownIcon className="size-3 text-muted-foreground ml-0.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2">
                            <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 flex items-center justify-between">
                                <span>Filter by Status</span>
                                {selectedStatuses.length > 0 && (
                                    <button
                                        onClick={clearAllStatuses}
                                        className="text-[11px] text-muted-foreground hover:text-foreground font-normal cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Clinical Macros */}
                            <div className="p-1.5 flex flex-col gap-1 bg-muted/40 rounded-md my-1 text-xs">
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground px-1">
                                    Quick Macros
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-[10px] px-2 flex-1 justify-center"
                                        onClick={setMacroNeedsAction}
                                    >
                                        Needs Action
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-[10px] px-2 flex-1 justify-center"
                                        onClick={setMacroActiveSchedule}
                                    >
                                        Active
                                    </Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />

                            {/* Status Checkboxes */}
                            {ALL_STATUSES.map((status) => {
                                const isChecked = selectedStatuses.includes(status);
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        checked={isChecked}
                                        onCheckedChange={() => toggleStatus(status)}
                                        className="text-xs py-1.5"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className={`size-2 rounded-full ${
                                                    status === "Confirmed"
                                                        ? "bg-emerald-500"
                                                        : status === "In Progress"
                                                        ? "bg-blue-500"
                                                        : status === "Scheduled"
                                                        ? "bg-purple-500"
                                                        : status === "Completed"
                                                        ? "bg-zinc-500"
                                                        : status === "Reschedule"
                                                        ? "bg-rose-500"
                                                        : status === "Cancelled"
                                                        ? "bg-red-500"
                                                        : "bg-amber-500"
                                                }`}
                                            />
                                            {status}
                                        </span>
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Specialist Filter (Admin only) */}
                    {isAdmin && doctors.length > 0 && (
                        <Select
                            value={selectedDoctorId}
                            onValueChange={(val) => setSelectedDoctorId(val ?? "ALL")}
                        >
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="All Specialists" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="ALL" className="text-xs">
                                        All Specialists
                                    </SelectItem>
                                    {doctors.map((doc) => (
                                        <SelectItem
                                            key={doc.id}
                                            value={String(doc.id)}
                                            className="text-xs"
                                        >
                                            {doc.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}

                    {/* Columns Visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" />
                            }
                        >
                            <Columns3Icon className="size-3.5" />
                            <span>Columns</span>
                            <ChevronDownIcon className="size-3 text-muted-foreground ml-0.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs font-semibold px-2 py-1">
                                Toggle Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide(),
                                )
                                .map((column) => {
                                    const headerText =
                                        column.id === "patientName"
                                            ? "Patient"
                                            : column.id === "service"
                                            ? "Procedure"
                                            : column.id === "time"
                                            ? "Date & Time"
                                            : column.id.charAt(0).toUpperCase() +
                                              column.id.slice(1);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="text-xs capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {headerText}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Reset Filters button */}
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={resetAllFilters}
                        >
                            <RotateCcwIcon className="size-3" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Table Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-semibold">
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
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setInspectAppointment(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2.5">
                                            <FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-44 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="size-8 text-muted-foreground/40" />
                                        <p className="text-sm font-medium text-foreground">
                                            No appointments match current filters
                                        </p>
                                        <p className="text-xs max-w-sm">
                                            Try broadening your search query, expanding the date range,
                                            or clearing active status filters.
                                        </p>
                                        {isFiltered && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={resetAllFilters}
                                                className="mt-2 text-xs"
                                            >
                                                Reset Filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2 text-xs text-muted-foreground">
                <div>
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} appointment(s) selected.
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-medium text-foreground">
                        Page {table.state.pagination.pageIndex + 1} of{" "}
                        {Math.max(1, table.getPageCount())}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeftIcon className="size-3.5" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                            <ChevronRightIcon className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Slide-Over Read-Only Audit Drawer */}
            <Sheet
                open={!!inspectAppointment}
                onOpenChange={(open) => {
                    if (!open) setInspectAppointment(null);
                }}
            >
                <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
                    {inspectAppointment && (
                        <div className="flex flex-col gap-6">
                            <SheetHeader className="text-left border-b pb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                                            inspectAppointment.status,
                                        )}`}
                                    >
                                        {inspectAppointment.status}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        #{inspectAppointment.id}
                                    </Badge>
                                </div>
                                <SheetTitle className="text-lg font-semibold mt-2">
                                    {inspectAppointment.patientName || inspectAppointment.patient_name}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    {inspectAppointment.service}
                                </SheetDescription>
                            </SheetHeader>

                            {/* Scheduled Visit Details */}
                            <div className="flex flex-col gap-3 bg-muted/40 p-4 rounded-xl text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <CalendarIcon className="size-3.5 text-primary" />
                                    Scheduled Time & Location
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Date
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.date}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Time Slot
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.time}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Suite / Cabin
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.room || "Room 101"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Duration
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.duration || "30 mins"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Specialist Doctor */}
                            <div className="flex flex-col gap-2 border rounded-xl p-4 text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <StethoscopeIcon className="size-3.5 text-primary" />
                                    Assigned Specialist
                                </h4>
                                <div className="text-muted-foreground pt-1">
                                    <p className="font-medium text-foreground text-sm">
                                        {inspectAppointment.doctor || "Unassigned"}
                                    </p>
                                </div>
                            </div>

                            {/* Patient Contact Information */}
                            <div className="flex flex-col gap-2 border rounded-xl p-4 text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <UserIcon className="size-3.5 text-primary" />
                                    Patient Contacts
                                </h4>
                                <div className="flex flex-col gap-1.5 pt-1 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="size-3.5 text-muted-foreground/70" />
                                        <span>
                                            {inspectAppointment.patientPhone ||
                                                inspectAppointment.patient_phone ||
                                                "Not provided"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MailIcon className="size-3.5 text-muted-foreground/70" />
                                        <span>
                                            {inspectAppointment.patientEmail ||
                                                inspectAppointment.patient_email ||
                                                "Not provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirmation Audit Details */}
                            <div className="flex flex-col gap-2 border rounded-xl p-4 text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <UserCheckIcon className="size-3.5 text-primary" />
                                    Confirmation Audit Trail
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Patient Confirmation
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.patientConfirmedAt
                                                ? new Date(
                                                      inspectAppointment.patientConfirmedAt,
                                                  ).toLocaleDateString()
                                                : "Pending Confirmation"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] text-muted-foreground/70">
                                            Doctor Confirmation
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {inspectAppointment.doctorConfirmedAt
                                                ? new Date(
                                                      inspectAppointment.doctorConfirmedAt,
                                                  ).toLocaleDateString()
                                                : "Pending Confirmation"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Notes */}
                            <div className="flex flex-col gap-2 border rounded-xl p-4 text-xs">
                                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                                    <FileTextIcon className="size-3.5 text-primary" />
                                    Clinical Notes & Preferences
                                </h4>
                                <p className="text-muted-foreground pt-1 whitespace-pre-wrap leading-relaxed">
                                    {inspectAppointment.notes ||
                                        "No internal notes or observations recorded."}
                                </p>
                            </div>

                            {/* Action to CRM Lead Profile */}
                            {(inspectAppointment.leadId ?? inspectAppointment.lead_id) && (
                                <div className="pt-2">
                                    <Link
                                        href={`/leads/${inspectAppointment.leadId ?? inspectAppointment.lead_id}`}
                                        prefetch
                                        className="w-full"
                                    >
                                        <Button
                                            variant="default"
                                            className="w-full text-xs gap-1.5 justify-center"
                                        >
                                            <ExternalLinkIcon className="size-3.5" />
                                            Open Patient Profile in CRM
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
