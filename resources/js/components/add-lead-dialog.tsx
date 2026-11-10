import * as React from "react";
import {
    UserPlusIcon,
    PhoneIcon,
    MailIcon,
    UserIcon,
    StethoscopeIcon,
    IndianRupeeIcon,
    AlertCircleIcon,
    TagIcon,
    FileTextIcon,
    Share2Icon,
    SlidersHorizontalIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Lead, LeadFormField, LeadPriority, LeadStatus } from "@/types/lead";

const CLINICAL_SERVICES = [
    { title: "Dental Implants & Cosmetic", doctor: "Dr. Eddie Lake" },
    { title: "Orthodontics & Clear Aligners", doctor: "Dr. Jamik Tashpulatov" },
    { title: "Cardiology Checkup & ECG", doctor: "Dr. Emily Whalen" },
    { title: "General & Preventative Care", doctor: "Dr. Eddie Lake" },
    { title: "Teeth Whitening & Hygiene", doctor: "Dr. Eddie Lake" },
    { title: "Root Canal & Endodontics", doctor: "Dr. Jamik Tashpulatov" },
];

const CLINIC_DOCTORS = [
    { name: "Dr. Eddie Lake", role: "Cosmetic & Implant Surgeon" },
    { name: "Dr. Jamik Tashpulatov", role: "Orthodontist Specialist" },
    { name: "Dr. Emily Whalen", role: "Cardiologist & Physician" },
    { name: "Dr. Sarah Jenkins", role: "General Dental Practitioner" },
];

const LEAD_STATUSES: LeadStatus[] = [
    "New",
    "Contacted",
    "Consultation Scheduled",
    "Treatment Plan Sent",
    "Won",
    "Lost",
];

const LEAD_PRIORITIES: LeadPriority[] = ["High", "Medium", "Low"];

const REFERRAL_SOURCES = [
    "Staff Booking",
    "Phone Inquiry",
    "Walk-in",
    "Website Form",
    "Doctor Referral",
    "Social Media Campaign",
    "Existing Patient Referral",
];

interface AddLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (newLead: Lead) => void;
    customFields?: LeadFormField[];
}

export function AddLeadDialog({
    open,
    onOpenChange,
    onSuccess,
    customFields: initialCustomFields,
}: AddLeadDialogProps) {
    const [name, setName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [service, setService] = React.useState(CLINICAL_SERVICES[0].title);
    const [doctor, setDoctor] = React.useState(CLINICAL_SERVICES[0].doctor);
    const [status, setStatus] = React.useState<LeadStatus>("New");
    const [priority, setPriority] = React.useState<LeadPriority>("Medium");
    const [value, setValue] = React.useState<number | string>(1500);
    const [source, setSource] = React.useState("Staff Booking");
    const [notes, setNotes] = React.useState("");

    // Dynamic Custom Fields State
    const [activeFields, setActiveFields] = React.useState<LeadFormField[]>(
        initialCustomFields?.filter((f) => f.is_active) || []
    );
    const [customFieldValues, setCustomFieldValues] = React.useState<
        Record<string, string>
    >({});

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Refresh active fields when dialog opens
    React.useEffect(() => {
        if (!open) return;

        let isMounted = true;
        const fetchFields = async () => {
            try {
                const res = await fetch("/api/settings/lead-fields");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && Array.isArray(data.fields)) {
                        setActiveFields(data.fields.filter((f: LeadFormField) => f.is_active));
                    }
                }
            } catch (err) {
                console.error("Failed to load active custom fields", err);
            }
        };

        fetchFields();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const handleServiceChange = (newService: string) => {
        setService(newService);
        const match = CLINICAL_SERVICES.find((s) => s.title === newService);
        if (match) {
            setDoctor(match.doctor);
        }
    };

    const handleCustomFieldChange = (fieldName: string, fieldValue: string) => {
        setCustomFieldValues((prev) => ({
            ...prev,
            [fieldName]: fieldValue,
        }));
    };

    const resetForm = () => {
        setName("");
        setPhone("");
        setEmail("");
        setService(CLINICAL_SERVICES[0].title);
        setDoctor(CLINICAL_SERVICES[0].doctor);
        setStatus("New");
        setPriority("Medium");
        setValue(1500);
        setSource("Staff Booking");
        setNotes("");
        setCustomFieldValues({});
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Please enter the patient's full name.");
            return;
        }

        if (!phone.trim()) {
            setError("Please enter a valid phone number.");
            return;
        }

        // Validate required custom fields
        for (const field of activeFields) {
            if (field.is_required) {
                const val = customFieldValues[field.name];
                if (!val || val.trim() === "") {
                    setError(`Please provide a value for required field "${field.label}".`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const payload = {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim() || null,
                service,
                doctor,
                status,
                priority,
                value: value ? Number(value) : 1500,
                source,
                notes: notes.trim() || null,
                custom_fields: customFieldValues,
            };

            const response = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const message =
                    data.message ||
                    (data.errors && Object.values(data.errors).flat().join(" ")) ||
                    "Failed to create lead.";
                setError(message);
                setIsSubmitting(false);
                return;
            }

            toast.success(`Patient lead "${name.trim()}" created successfully!`);
            if (onSuccess && data.lead) {
                onSuccess(data.lead);
            }
            resetForm();
            onOpenChange(false);
        } catch (err) {
            console.error("Error creating lead:", err);
            setError("Network error while creating lead. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserPlusIcon className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                                Add New Patient Lead
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Log an intake inquiry with clinical details and staff custom attributes.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                            <AlertCircleIcon className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Patient Contact Information */}
                    <div className="rounded-lg border bg-muted/10 p-3 flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <UserIcon className="size-3.5 text-primary" />
                            Patient Contact Details
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="lead-name" className="text-xs font-medium">
                                    Patient Full Name <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        id="lead-name"
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-8 text-xs h-8 bg-background"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="lead-phone" className="text-xs font-medium">
                                    Phone Number <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        id="lead-phone"
                                        type="tel"
                                        required
                                        placeholder="e.g. +91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-8 text-xs h-8 bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="lead-email" className="text-xs font-medium">
                                Email Address <span className="text-muted-foreground text-[11px]">(Optional)</span>
                            </Label>
                            <div className="relative">
                                <MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    id="lead-email"
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-8 text-xs h-8 bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clinical Service & Doctor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">
                                Clinical Service <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={service}
                                onValueChange={(val) => handleServiceChange(val ?? CLINICAL_SERVICES[0].title)}
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Select clinical service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {CLINICAL_SERVICES.map((s) => (
                                            <SelectItem key={s.title} value={s.title} className="text-xs">
                                                {s.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">
                                Assigned Doctor <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={doctor}
                                onValueChange={(val) => setDoctor(val ?? CLINIC_DOCTORS[0].name)}
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Select specialist" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {CLINIC_DOCTORS.map((d) => (
                                            <SelectItem key={d.name} value={d.name} className="text-xs">
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Status, Priority & Total Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">Pipeline Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => setStatus(val as LeadStatus)}
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {LEAD_STATUSES.map((st) => (
                                            <SelectItem key={st} value={st} className="text-xs">
                                                {st}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">Priority Level</Label>
                            <Select
                                value={priority}
                                onValueChange={(val) => setPriority(val as LeadPriority)}
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {LEAD_PRIORITIES.map((pr) => (
                                            <SelectItem key={pr} value={pr} className="text-xs">
                                                {pr} Priority
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="lead-value" className="text-xs font-medium">
                                Total Value (₹)
                            </Label>
                            <div className="relative">
                                <IndianRupeeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    id="lead-value"
                                    type="number"
                                    min="0"
                                    step="100"
                                    placeholder="1500"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="pl-8 text-xs h-8 bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Referral Source */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium">Referral Source</Label>
                        <Select
                            value={source}
                            onValueChange={(val) => setSource(val ?? "Staff Booking")}
                        >
                            <SelectTrigger className="w-full text-xs h-8">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {REFERRAL_SOURCES.map((src) => (
                                        <SelectItem key={src} value={src} className="text-xs">
                                            {src}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DYNAMIC CUSTOM FIELDS (Staff Configured) */}
                    {activeFields.length > 0 && (
                        <div className="rounded-lg border bg-secondary/15 p-3 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                    <SlidersHorizontalIcon className="size-3.5 text-primary" />
                                    Custom Clinical Details (Configured in Settings)
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {activeFields.length} custom field{activeFields.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {activeFields.map((field) => (
                                    <div key={field.id} className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-medium">
                                            {field.label}{" "}
                                            {field.is_required ? (
                                                <span className="text-destructive">*</span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">(Optional)</span>
                                            )}
                                        </Label>

                                        {field.type === "dropdown" ? (
                                            <Select
                                                value={customFieldValues[field.name] || ""}
                                                onValueChange={(val) =>
                                                    handleCustomFieldChange(field.name, val ?? "")
                                                }
                                            >
                                                <SelectTrigger className="w-full text-xs h-8 bg-background">
                                                    <SelectValue placeholder={`Select ${field.label}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {field.options?.map((opt) => (
                                                            <SelectItem
                                                                key={opt}
                                                                value={opt}
                                                                className="text-xs"
                                                            >
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                type="text"
                                                placeholder={`Enter ${field.label}...`}
                                                value={customFieldValues[field.name] || ""}
                                                onChange={(e) =>
                                                    handleCustomFieldChange(field.name, e.target.value)
                                                }
                                                className="text-xs h-8 bg-background"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clinical Notes / Symptoms */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="lead-notes" className="text-xs font-medium">
                            Clinical Notes / Symptoms{" "}
                            <span className="text-muted-foreground text-[11px]">(Optional)</span>
                        </Label>
                        <textarea
                            id="lead-notes"
                            rows={3}
                            placeholder="Initial patient observations, primary symptoms, or scheduling preferences..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    <DialogFooter className="mt-2 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !name.trim() || !phone.trim()}
                            className="bg-primary text-primary-foreground font-medium"
                        >
                            {isSubmitting ? "Creating Lead..." : "Create Patient Lead"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
