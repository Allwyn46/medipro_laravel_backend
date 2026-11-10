import * as React from "react";
import { Link } from "@inertiajs/react";
import {
    PlusIcon,
    Trash2Icon,
    SlidersHorizontalIcon,
    ArrowLeftIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    XIcon,
    TypeIcon,
    ListFilterIcon,
} from "lucide-react";
import { toast } from "sonner";

import Layout from "../layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LeadFormField } from "@/types/lead";

interface Props {
    fields: LeadFormField[];
}

export default function LeadSettingsPage({ fields: initialFields }: Props) {
    const [fields, setFields] = React.useState<LeadFormField[]>(initialFields || []);
    const [isAddOpen, setIsAddOpen] = React.useState(false);

    // Add Field Form State
    const [label, setLabel] = React.useState("");
    const [fieldType, setFieldType] = React.useState<"text" | "dropdown">("text");
    const [options, setOptions] = React.useState<string[]>([]);
    const [optionInput, setOptionInput] = React.useState("");
    const [isRequired, setIsRequired] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

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
            toast.success(`Custom field "${trimmedLabel}" created successfully.`);
            resetForm();
            setIsAddOpen(false);
        } catch (err) {
            console.error("Error creating custom field:", err);
            setError("Network error. Could not create custom field.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (id: number, fieldLabel: string) => {
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
                toast.success(`Field "${fieldLabel}" deactivated.`);
            } else {
                toast.error("Failed to deactivate field.");
            }
        } catch (err) {
            console.error("Error deactivating field:", err);
            toast.error("Network error while deactivating field.");
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
                                    <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" />
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
                            Configure custom intake fields for clinic staff when capturing new patient inquiries.
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

                {/* Configuration Table Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Configured Intake Fields
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Fields shown dynamically in the "Add New Lead" intake modal.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {fields.filter((f) => f.is_active).length} Active Fields
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {fields.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                                    <SlidersHorizontalIcon className="size-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    No Custom Fields Configured Yet
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                                    Add text inputs or dropdown selectors to capture clinic-specific details (such as Insurance Carrier, Referral Clinic, or Chief Complaint).
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        resetForm();
                                        setIsAddOpen(true);
                                    }}
                                >
                                    <PlusIcon className="size-3.5" />
                                    Add First Custom Field
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="text-xs bg-muted/40">
                                            <TableHead className="w-[200px]">Field Label</TableHead>
                                            <TableHead className="w-[180px]">Field Key</TableHead>
                                            <TableHead className="w-[140px]">Input Type</TableHead>
                                            <TableHead>Configured Options</TableHead>
                                            <TableHead className="w-[100px]">Required</TableHead>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead className="w-[80px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field) => (
                                            <TableRow key={field.id} className="text-xs">
                                                <TableCell className="font-semibold text-foreground">
                                                    {field.label}
                                                </TableCell>
                                                <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                    custom_fields.{field.name}
                                                </TableCell>
                                                <TableCell>
                                                    {field.type === "dropdown" ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 gap-1 font-medium"
                                                        >
                                                            <ListFilterIcon className="size-3" />
                                                            Dropdown
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 gap-1 font-medium"
                                                        >
                                                            <TypeIcon className="size-3" />
                                                            Text Field
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {field.type === "dropdown" && field.options && field.options.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 max-w-md">
                                                            {field.options.map((opt, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
                                                                >
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-[11px]">
                                                            Free-form clinical text
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {field.is_required ? (
                                                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                                            Required
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                                                            Optional
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {field.is_active ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[10px] py-0"
                                                        >
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[10px] py-0 text-muted-foreground">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {field.is_active ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleDeactivate(field.id, field.label)}
                                                            title="Deactivate field"
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2Icon className="size-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground italic">
                                                            Deactivated
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

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

                            {/* Dropdown Options Builder (Rendered if fieldType === 'dropdown') */}
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
                                    disabled={isSubmitting || !label.trim() || (fieldType === "dropdown" && options.length === 0)}
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
