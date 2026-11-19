import * as React from "react";
import { Link } from "@inertiajs/react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    pointerWithin,
    closestCorners,
    type DragStartEvent,
    type DragEndEvent,
    type CollisionDetection,
} from "@dnd-kit/core";
import {
    PlusIcon,
    Trash2Icon,
    SlidersHorizontalIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    XIcon,
    TypeIcon,
    ListFilterIcon,
    GripVerticalIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
} from "lucide-react";
import { toast } from "sonner";

import Layout from "../layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LeadFormField } from "@/types/lead";

interface Props {
    fields: LeadFormField[];
}

/** Standard core fields that are non-removable and excluded from the Kanban board */
const CORE_BUILTIN_FIELDS = [
    { name: "Patient Full Name", type: "Text", required: true },
    { name: "Phone Number", type: "Phone", required: true },
    { name: "Age", type: "Text", required: true },
    { name: "Blood Group", type: "Text", required: true },
    { name: "Clinical Service", type: "Dropdown", required: true },
    { name: "Assigned Doctor", type: "Dropdown", required: true },
    { name: "Email Address", type: "Email", required: false },
    { name: "Pipeline Status", type: "Dropdown", required: true },
    { name: "Priority Level", type: "Dropdown", required: true },
    { name: "Total Value (₹)", type: "Currency", required: true },
    { name: "Referral Source", type: "Dropdown", required: true },
    { name: "Clinical Notes", type: "Textarea", required: false },
];

/** Droppable column container for Active or Inactive fields */
function DroppableColumn({
    id,
    title,
    subtitle,
    count,
    variant,
    children,
    emptyMessage,
}: {
    id: "active" | "inactive";
    title: string;
    subtitle: string;
    count: number;
    variant: "active" | "inactive";
    children: React.ReactNode;
    emptyMessage: string;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: { type: "column", status: variant === "active" },
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border transition-all duration-200 min-h-[500px] ${
                variant === "active"
                    ? isOver
                        ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-lg"
                        : "border-emerald-200/80 bg-emerald-50/15 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                    : isOver
                    ? "border-slate-500 bg-slate-500/10 dark:bg-slate-900/40 ring-2 ring-slate-400/40 shadow-lg"
                    : "border-border bg-muted/20"
            }`}
        >
            {/* Column Header */}
            <div
                className={`p-4 border-b flex items-center justify-between rounded-t-xl transition-colors ${
                    variant === "active"
                        ? isOver
                            ? "border-emerald-300 bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-900/50"
                            : "border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/40"
                        : isOver
                        ? "border-slate-300 bg-slate-200/60 dark:border-slate-700 dark:bg-slate-800/60"
                        : "border-border bg-muted/40"
                }`}
            >
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        {variant === "active" ? (
                            <EyeIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <EyeOffIcon className="size-4 text-muted-foreground" />
                        )}
                        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isOver && (
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full animate-pulse ${
                                variant === "active"
                                    ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                                    : "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                            }`}
                        >
                            Drop here
                        </span>
                    )}
                    <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-2 py-0.5 ${
                            variant === "active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-secondary text-muted-foreground border-border"
                        }`}
                    >
                        {count} {variant === "active" ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </div>

            {/* Column Drop Area */}
            <div className="p-3.5 flex flex-col gap-3 flex-1 overflow-y-auto">
                {count === 0 ? (
                    <div
                        className={`flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg flex-1 min-h-[300px] transition-colors ${
                            isOver
                                ? variant === "active"
                                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30"
                                    : "border-slate-500 bg-slate-50/40 dark:bg-slate-900/30"
                                : "border-muted-foreground/25"
                        }`}
                    >
                        <div
                            className={`flex size-10 items-center justify-center rounded-full mb-2 ${
                                variant === "active"
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {variant === "active" ? (
                                <CheckCircle2Icon className="size-5" />
                            ) : (
                                <EyeOffIcon className="size-5" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground max-w-xs">{emptyMessage}</p>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

/** Draggable & Droppable Kanban card representing a single custom intake field */
function CustomFieldCard({
    field,
    onToggleStatus,
    onDelete,
    isUpdating,
}: {
    field: LeadFormField;
    onToggleStatus: (id: number, nextStatus: boolean, label: string) => void;
    onDelete: (id: number, label: string) => void;
    isUpdating?: boolean;
}) {
    // Make card both draggable and droppable so dropping on top of a card works seamlessly
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: String(field.id),
        data: { field, status: field.is_active },
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `card-${field.is_active ? "active" : "inactive"}-${field.id}`,
        data: { field, status: field.is_active },
        disabled: isDragging,
    });

    const setCombinedRef = React.useCallback(
        (node: HTMLElement | null) => {
            setDragRef(node);
            setDropRef(node);
        },
        [setDragRef, setDropRef]
    );

    return (
        <div
            ref={setCombinedRef}
            {...attributes}
            {...listeners}
            className={`group relative rounded-xl border p-3.5 shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                isDragging
                    ? "opacity-25 border-dashed border-primary shadow-none bg-muted/40"
                    : isOver
                    ? "ring-2 ring-primary/40 border-primary"
                    : "hover:shadow-md hover:border-primary/40"
            } ${
                field.is_active
                    ? "border-border bg-card"
                    : "border-muted-foreground/20 bg-card/65 opacity-85 hover:opacity-100"
            } ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
        >
            <div className="flex items-start justify-between gap-2">
                {/* Drag Handle & Label Details */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div
                        className="mt-0.5 text-muted-foreground group-hover:text-foreground p-0.5 rounded transition-colors shrink-0"
                        title="Click and drag card to move between Active and Inactive"
                    >
                        <GripVerticalIcon className="size-4 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-semibold text-foreground truncate">
                                {field.label}
                            </h3>
                            {field.is_required ? (
                                field.is_active ? (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">
                                        Required *
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] py-0 px-1.5 h-4 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800"
                                    >
                                        Required when active
                                    </Badge>
                                )
                            ) : (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground">
                                    Optional
                                </Badge>
                            )}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                            custom_fields.{field.name}
                        </p>
                    </div>
                </div>

                {/* Input Type Badge */}
                <div className="shrink-0">
                    {field.type === "dropdown" ? (
                        <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 gap-1 text-[10px] py-0 font-medium"
                        >
                            <ListFilterIcon className="size-2.5" />
                            Dropdown
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 gap-1 text-[10px] py-0 font-medium"
                        >
                            <TypeIcon className="size-2.5" />
                            Text
                        </Badge>
                    )}
                </div>
            </div>

            {/* Dropdown Options List if applicable */}
            {field.type === "dropdown" && field.options && field.options.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-medium text-muted-foreground block mb-1">
                        Configured Options ({field.options.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {field.options.map((opt, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                            >
                                {opt}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Card Action Footer */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
                {/* One-click toggle fallback for touch and accessibility */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(field.id, !field.is_active, field.label);
                    }}
                    className="h-7 text-[11px] gap-1.5 px-2.5 font-normal hover:bg-secondary cursor-pointer"
                >
                    {field.is_active ? (
                        <>
                            <span>Move to Inactive</span>
                            <ArrowRightIcon className="size-3 text-muted-foreground" />
                        </>
                    ) : (
                        <>
                            <ArrowLeftIcon className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Move to Active</span>
                        </>
                    )}
                </Button>

                {/* Deactivate / Delete Action */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isUpdating}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(field.id, field.label);
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Deactivate or remove field"
                >
                    <Trash2Icon className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

/** Static preview for DragOverlay following pointer when dragging */
function DragPreviewCard({ field }: { field: LeadFormField }) {
    return (
        <div className="rounded-xl border border-primary bg-card p-3.5 shadow-2xl ring-2 ring-primary/40 w-72 sm:w-80 cursor-grabbing opacity-95">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <GripVerticalIcon className="size-4 shrink-0 text-primary mt-0.5" />
                    <div>
                        <h3 className="text-xs font-semibold text-foreground truncate">{field.label}</h3>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                            custom_fields.{field.name}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                    {field.type}
                </Badge>
            </div>
        </div>
    );
}

export default function LeadSettingsPage({ fields: initialFields }: Props) {
    const [fields, setFields] = React.useState<LeadFormField[]>(initialFields || []);
    const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
    const [updatingId, setUpdatingId] = React.useState<number | null>(null);
    const [isAddOpen, setIsAddOpen] = React.useState(false);

    // Add Field Modal State
    const [label, setLabel] = React.useState("");
    const [fieldType, setFieldType] = React.useState<"text" | "dropdown">("text");
    const [options, setOptions] = React.useState<string[]>([]);
    const [optionInput, setOptionInput] = React.useState("");
    const [isRequired, setIsRequired] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Dnd-kit sensors configuration
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Collision detection strategy prioritizing cursor/pointer location
    const collisionDetectionStrategy: CollisionDetection = React.useCallback((args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }
        return closestCorners(args);
    }, []);

    const activeFields = React.useMemo(() => fields.filter((f) => f.is_active), [fields]);
    const inactiveFields = React.useMemo(() => fields.filter((f) => !f.is_active), [fields]);

    const activeDragField = React.useMemo(() => {
        if (!activeDragId) return null;
        return fields.find((f) => String(f.id) === activeDragId) || null;
    }, [activeDragId, fields]);

    const resetForm = () => {
        setLabel("");
        setFieldType("text");
        setOptions([]);
        setOptionInput("");
        setIsRequired(false);
        setError(null);
    };

    const handleAddOption = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = optionInput.trim();
        if (!trimmed) return;
        if (options.includes(trimmed)) {
            setError(`Option "${trimmed}" is already added.`);
            return;
        }
        setOptions([...options, trimmed]);
        setOptionInput("");
        setError(null);
    };

    const handleRemoveOption = (indexToRemove: number) => {
        setOptions(options.filter((_, idx) => idx !== indexToRemove));
    };

    const handleCreateField = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedLabel = label.trim();
        if (!trimmedLabel) {
            setError("Field label is required.");
            return;
        }

        if (fieldType === "dropdown" && options.length === 0) {
            setError("Dropdown fields require at least one selectable option.");
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const response = await fetch("/api/settings/lead-fields", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    label: trimmedLabel,
                    type: fieldType,
                    options: fieldType === "dropdown" ? options : null,
                    is_required: isRequired,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const message =
                    data.message ||
                    (data.errors && Object.values(data.errors).flat().join(" ")) ||
                    "Failed to create field.";
                setError(message);
                setIsSubmitting(false);
                return;
            }

            if (data.field) {
                setFields((prev) => [...prev, data.field]);
            }
            toast.success(`Custom field "${trimmedLabel}" created in Active column.`);
            resetForm();
            setIsAddOpen(false);
        } catch (err) {
            console.error("Error creating custom field:", err);
            setError("Network error. Could not create custom field.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Toggle status via API with optimistic update and rollback */
    const handleStatusChange = async (id: number, nextStatus: boolean, fieldLabel: string) => {
        // Optimistic UI state update
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, is_active: nextStatus } : f))
        );
        setUpdatingId(id);

        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const response = await fetch(`/api/settings/lead-fields/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    is_active: nextStatus,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update status on server.");
            }

            toast.success(
                nextStatus
                    ? `"${fieldLabel}" moved to Active (visible in Add Lead form)`
                    : `"${fieldLabel}" moved to Inactive (hidden from Add Lead form)`,
                {
                    action: {
                        label: "Undo",
                        onClick: () => handleStatusChange(id, !nextStatus, fieldLabel),
                    },
                }
            );
        } catch (err) {
            console.error("Error updating field status:", err);
            // Revert state on failure
            setFields((prev) =>
                prev.map((f) => (f.id === id ? { ...f, is_active: !nextStatus } : f))
            );
            toast.error(`Could not update status for "${fieldLabel}". Reverting.`);
        } finally {
            setUpdatingId(null);
        }
    };

    /** Handle Deactivate or Delete confirmation */
    const handleDelete = async (id: number, fieldLabel: string) => {
        if (!confirm(`Are you sure you want to deactivate the field "${fieldLabel}"?`)) {
            return;
        }

        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const response = await fetch(`/api/settings/lead-fields/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                setFields((prev) =>
                    prev.map((f) => (f.id === id ? { ...f, is_active: false } : f))
                );
                toast.success(`Field "${fieldLabel}" moved to Inactive.`);
            } else {
                toast.error("Failed to deactivate field.");
            }
        } catch (err) {
            console.error("Error deactivating field:", err);
            toast.error("Network error while deactivating field.");
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const fieldId = Number(active.id);
        const draggedField = fields.find((f) => f.id === fieldId);
        if (!draggedField) return;

        let targetStatus: boolean | null = null;
        if (over.id === "active") {
            targetStatus = true;
        } else if (over.id === "inactive") {
            targetStatus = false;
        } else if (over.data?.current && typeof over.data.current.status === "boolean") {
            targetStatus = over.data.current.status;
        } else {
            const overIdStr = String(over.id);
            if (overIdStr.includes("active")) {
                targetStatus = true;
            } else if (overIdStr.includes("inactive")) {
                targetStatus = false;
            }
        }

        if (targetStatus !== null && targetStatus !== draggedField.is_active) {
            handleStatusChange(draggedField.id, targetStatus, draggedField.label);
        }
    };

    return (
        <Layout title="Lead Form Settings | MediPro CRM">
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                render={
                                    <Link
                                        href="/leads"
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                    />
                                }
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                Back to Leads
                            </Button>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <SlidersHorizontalIcon className="size-6 text-primary" />
                            Lead Form Settings
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Manage custom intake fields via Kanban table. Drag fields between Active and Inactive to toggle visibility in the Add New Lead form.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsAddOpen(true);
                            }}
                            className="bg-primary text-primary-foreground font-medium text-xs sm:text-sm"
                        >
                            <PlusIcon className="size-4" />
                            <span>Add Custom Field</span>
                        </Button>
                    </div>
                </div>

                {/* Excluded Core System Fields Banner */}
                <Card className="border-border/60 bg-muted/20">
                    <CardHeader className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <LockIcon className="size-4 text-muted-foreground" />
                                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                                    System Core Fields (Permanent & Excluded from Kanban)
                                </CardTitle>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                12 standard fields always active & required for clinical scheduling
                            </span>
                        </div>
                        <CardDescription className="text-[11px] text-muted-foreground mt-1">
                            These 12 standard clinical intake fields are core dependencies and cannot be disabled or hidden.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-3.5 pt-0">
                        <div className="flex flex-wrap gap-1.5">
                            {CORE_BUILTIN_FIELDS.map((core) => (
                                <span
                                    key={core.name}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground shadow-2xs"
                                >
                                    <LockIcon className="size-2.5 text-muted-foreground" />
                                    <span>{core.name}</span>
                                    {core.required ? (
                                        <span className="text-destructive font-semibold">*</span>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground font-normal">(opt)</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* TWO-COLUMN KANBAN BOARD */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetectionStrategy}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Active Fields Column */}
                        <DroppableColumn
                            id="active"
                            title="Active Fields"
                            subtitle="Shown dynamically in the 'Add New Lead' modal"
                            count={activeFields.length}
                            variant="active"
                            emptyMessage="No active custom fields. Drag fields here or create a new field to display it in the intake form."
                        >
                            {activeFields.map((field) => (
                                <CustomFieldCard
                                    key={field.id}
                                    field={field}
                                    onToggleStatus={handleStatusChange}
                                    onDelete={handleDelete}
                                    isUpdating={updatingId === field.id}
                                />
                            ))}
                        </DroppableColumn>

                        {/* Inactive Fields Column */}
                        <DroppableColumn
                            id="inactive"
                            title="Inactive Fields"
                            subtitle="Hidden from 'Add New Lead' (Historical data preserved)"
                            count={inactiveFields.length}
                            variant="inactive"
                            emptyMessage="No inactive custom fields. Drag active fields here to deactivate and hide them from intake."
                        >
                            {inactiveFields.map((field) => (
                                <CustomFieldCard
                                    key={field.id}
                                    field={field}
                                    onToggleStatus={handleStatusChange}
                                    onDelete={handleDelete}
                                    isUpdating={updatingId === field.id}
                                />
                            ))}
                        </DroppableColumn>
                    </div>

                    {/* Drag Overlay Preview */}
                    <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                        {activeDragField ? <DragPreviewCard field={activeDragField} /> : null}
                    </DragOverlay>
                </DndContext>

                {/* Add Custom Field Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-md p-5 sm:p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <SlidersHorizontalIcon className="size-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-semibold">
                                        Add Custom Lead Field
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        Create a new dynamic field that will appear in the staff lead intake form.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleCreateField} className="flex flex-col gap-4 mt-2">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                                    <AlertCircleIcon className="size-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Field Label */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="field-label" className="text-xs font-medium">
                                    Field Label <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="field-label"
                                    type="text"
                                    required
                                    placeholder="e.g. Insurance Provider, Preferred Language"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    className="text-xs h-8"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Staff-facing label displayed above the input field.
                                </span>
                            </div>

                            {/* Field Type Selection: Text vs Dropdown */}
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-medium">
                                    Field Input Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={fieldType}
                                    onValueChange={(val) => {
                                        if (val === "text" || val === "dropdown") {
                                            setFieldType(val);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full text-xs h-8">
                                        <SelectValue placeholder="Choose field type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="text" className="text-xs">
                                                <span className="font-medium">Text Field</span> — Single-line free text input
                                            </SelectItem>
                                            <SelectItem value="dropdown" className="text-xs">
                                                <span className="font-medium">Dropdown Field</span> — Single-select from typed options
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dropdown Options Builder */}
                            {fieldType === "dropdown" && (
                                <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold">
                                            Dropdown Options <span className="text-destructive">*</span>
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">
                                            {options.length} option{options.length === 1 ? "" : "s"} added
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Type an option and press Add..."
                                            value={optionInput}
                                            onChange={(e) => setOptionInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddOption();
                                                }
                                            }}
                                            className="text-xs h-8 bg-background flex-1"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleAddOption()}
                                            disabled={!optionInput.trim()}
                                            className="h-8 text-xs shrink-0"
                                        >
                                            Add Option
                                        </Button>
                                    </div>

                                    {/* Pill list of added options */}
                                    {options.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1 max-h-36 overflow-y-auto p-1 rounded-md border bg-background">
                                            {options.map((opt, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="gap-1.5 py-1 px-2 text-xs font-medium"
                                                >
                                                    <span>{opt}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(idx)}
                                                        className="rounded-full hover:bg-muted-foreground/20 p-0.5 text-muted-foreground hover:text-destructive cursor-pointer"
                                                        title={`Remove ${opt}`}
                                                    >
                                                        <XIcon className="size-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground italic">
                                            No options added yet. Type an option above and click "Add Option".
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Is Required Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="is-required"
                                    checked={isRequired}
                                    onCheckedChange={(checked) => setIsRequired(checked === true)}
                                />
                                <Label
                                    htmlFor="is-required"
                                    className="text-xs font-normal cursor-pointer select-none"
                                >
                                    Make this field required during lead intake
                                </Label>
                            </div>

                            <DialogFooter className="mt-2 gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        resetForm();
                                        setIsAddOpen(false);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={
                                        isSubmitting ||
                                        !label.trim() ||
                                        (fieldType === "dropdown" && options.length === 0)
                                    }
                                    className="bg-primary text-primary-foreground font-medium"
                                >
                                    {isSubmitting ? "Saving Field..." : "Save Field"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
