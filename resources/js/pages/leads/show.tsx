import * as React from "react";
import { Link, router } from "@inertiajs/react";
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
    DropletIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    StethoscopeIcon,
    CreditCardIcon,
    TrophyIcon,
    UploadCloudIcon,
    PrinterIcon,
    DownloadIcon,
    FileUpIcon,
    EyeIcon,
    ImageIcon,
    XIcon,
    Loader2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookAppointmentDialog } from "@/components/book-appointment-dialog";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { BrandLogo } from "@/components/brand-logo";
import { toast } from "sonner";
import Layout from "../layout/Layout";
import type {
    Lead,
    LeadActivity,
    LeadDocument,
    LeadFormField,
    LeadPriority,
    LeadStatus,
    PaymentStatus,
} from "@/types/lead";

function getStatusBadgeClass(status: LeadStatus | string) {
    switch (status) {
        case "New":
        case "New patients":
        case "New Patients":
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
        case "Contacted":
        case "Contacted patients":
        case "Contacted Patients":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Consultation Scheduled":
        case "Consultation Booked":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        case "Treatment Plan Sent":
        case "Follow up patients":
        case "Follow-up Patients":
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
        case "Won":
        case "Confirmed patients":
        case "Confirmed Patients":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "Lost":
        case "Reschedule":
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

function getPaymentBadgeClass(status?: string) {
    switch (status) {
        case "Paid":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "Partially Paid":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Pending":
        default:
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    }
}

function getCategoryBadgeClass(category: string) {
    switch (category) {
        case "X-Ray":
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
        case "Blood Test":
            return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
        case "MRI / CT Scan":
            return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800";
        case "Ultrasound":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        case "Lab Report":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        case "Medication Prescription":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "General Diagnostic":
            return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
        default:
            return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
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
    customFields = [],
    documents: initialDocuments = [],
}: {
    lead: Lead;
    allLeads?: Lead[];
    customFields?: LeadFormField[];
    documents?: LeadDocument[];
}) {
    const getFieldLabel = (key: string) => {
        const match = customFields.find((f) => f.name === key);
        return match?.label || key.replace(/_/g, " ");
    };
    const [currentStatus, setCurrentStatus] = React.useState<LeadStatus>(
        lead.status
    );
    const [currentValue, setCurrentValue] = React.useState<number>(
        Number(lead.value) || 0
    );
    const [currentPaymentStatus, setCurrentPaymentStatus] =
        React.useState<PaymentStatus>(
            lead.payment_status || lead.paymentStatus || "Pending"
        );
    const [activities, setActivities] = React.useState<LeadActivity[]>(
        () => lead.activities || []
    );
    const [documents, setDocuments] = React.useState<LeadDocument[]>(
        () => (initialDocuments.length > 0 ? initialDocuments : lead.documents || [])
    );
    const [prescriptionCategory, setPrescriptionCategory] = React.useState("X-Ray");
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Print & Preview Modal State
    const [previewDoc, setPreviewDoc] = React.useState<LeadDocument | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "date", desc: true },
    ]);
    const [newNote, setNewNote] = React.useState("");
    const [isSavingNote, setIsSavingNote] = React.useState(false);

    React.useEffect(() => {
        setCurrentStatus(lead.status);
        setCurrentValue(Number(lead.value) || 0);
        setCurrentPaymentStatus(
            lead.payment_status || lead.paymentStatus || "Pending"
        );
        setActivities(lead.activities || []);
        setDocuments(
            initialDocuments.length > 0
                ? initialDocuments
                : lead.documents || []
        );
    }, [lead, initialDocuments]);

    // Won popup dialog state
    const [isWonDialogOpen, setIsWonDialogOpen] = React.useState(false);
    const [wonAmount, setWonAmount] = React.useState(
        String(lead.value || 1500)
    );
    const [wonPaymentStatus, setWonPaymentStatus] =
        React.useState<PaymentStatus>(
            lead.payment_status || lead.paymentStatus || "Paid"
        );
    const [wonNotes, setWonNotes] = React.useState("");
    const [isSavingWon, setIsSavingWon] = React.useState(false);

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

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        const noteText = newNote.trim();
        setIsSavingNote(true);

        try {
            const res = await fetch(`/api/leads/${lead.id}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    note: noteText,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to save note");
            }

            const data = await res.json();
            if (data.activity) {
                setActivities((prev) => [data.activity, ...prev]);
            }
            setNewNote("");
            toast.success("Clinical Note Added", {
                description: "Saved to lead activity history.",
            });
        } catch (error: any) {
            console.error("Error saving note:", error);
            toast.error("Failed to save note", {
                description: error.message || "Please try again.",
            });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleStatusSelect = (status: LeadStatus) => {
        if (
            status === "Won" ||
            status === "Confirmed patients" ||
            status === "Confirmed Patients"
        ) {
            setWonAmount(String(currentValue || 1500));
            setWonPaymentStatus("Paid");
            setWonNotes("");
            setIsWonDialogOpen(true);
            return;
        }

        saveStatusUpdate(status);
    };

    const saveStatusUpdate = async (status: LeadStatus) => {
        setCurrentStatus(status);
        try {
            const res = await fetch(`/api/leads/${lead.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    status,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update lead status");
            }

            const data = await res.json();
            if (data.activity) {
                setActivities((prev) => [data.activity, ...prev]);
            }
            toast.success("Status Updated", {
                description: `Lead status changed to ${status}.`,
            });
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status", {
                description: error.message || "Please try again.",
            });
        }
    };

    const handleWonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(wonAmount);
        if (isNaN(numericAmount) || numericAmount < 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsSavingWon(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    status: "Confirmed patients",
                    value: numericAmount,
                    payment_status: wonPaymentStatus,
                    notes: wonNotes.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to mark as confirmed patient");
            }

            const data = await res.json();
            setCurrentStatus("Confirmed patients");
            setCurrentValue(numericAmount);
            setCurrentPaymentStatus(wonPaymentStatus);
            if (data.activity) {
                setActivities((prev) => [data.activity, ...prev]);
            }
            setIsWonDialogOpen(false);
            toast.success("Consultation Completed — Confirmed Patient!", {
                description: `Total Value updated to ₹${numericAmount.toLocaleString()} (${wonPaymentStatus}). Saved to database.`,
            });
        } catch (error: any) {
            console.error("Error saving confirmed patient consultation:", error);
            toast.error("Failed to confirm patient", {
                description: error.message || "Please check your network and try again.",
            });
        } finally {
            setIsSavingWon(false);
        }
    };

    const activeDocuments = React.useMemo(() => {
        return documents.filter((d) => d.status === "active");
    }, [documents]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 25 * 1024 * 1024) {
                toast.error("File too large", {
                    description: "Maximum file size is 25MB.",
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (selectedFile.size > 25 * 1024 * 1024) {
            toast.error("File size exceeds 25MB limit");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("category", prescriptionCategory);
        formData.append("file", selectedFile);

        try {
            const res = await fetch(`/api/leads/${lead.id}/documents`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to upload document");
            }

            const data = await res.json();
            if (data.document) {
                setDocuments((prev) => [data.document, ...prev]);
            }
            if (data.activity) {
                setActivities((prev) => [data.activity, ...prev]);
            }

            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            toast.success("Prescription Uploaded", {
                description: `${data.document.category} recorded for ${lead.name}.`,
            });
        } catch (error: any) {
            console.error("Error uploading prescription:", error);
            toast.error("Upload Failed", {
                description:
                    error.message || "Please check your file and try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenPreview = (doc: LeadDocument) => {
        setPreviewDoc(doc);
        setIsPreviewOpen(true);
    };

    const handlePrintDocument = (doc: LeadDocument) => {
        const printWindow = window.open("", "_blank", "width=850,height=900");
        if (!printWindow) {
            toast.error("Popup Blocked", {
                description:
                    "Please allow popups to print the prescription document.",
            });
            return;
        }

        const patientName = lead.name || "—";
        const patientAge = lead.age ? `${lead.age} yrs` : "—";
        const patientBloodGroup = lead.blood_group || lead.bloodGroup || "—";
        const doctorName = lead.doctor || "—";
        const category = doc.category || "Prescription / Diagnostic";
        const formattedDate = doc.created_at
            ? new Date(doc.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : new Date().toLocaleDateString();

        const mediaHtml = doc.isImage
            ? `<div class="media-container"><img src="${doc.streamUrl}" alt="${doc.category}" onload="window.print();" /></div>`
            : `<div class="media-container"><iframe src="${doc.streamUrl}#toolbar=0" style="width:100%;height:750px;border:none;"></iframe><p class="print-tip">For multi-page PDFs, use the browser's PDF viewer print option if preferred.</p></div>`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Prescription - ${patientName} - ${category}</title>
    <meta charset="utf-8" />
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 24px;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .clinic-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .clinic-title {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0f172a;
            text-transform: uppercase;
        }
        .clinic-subtitle {
            font-size: 11px;
            color: #0284c7;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .doc-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
        }
        .meta-item {
            display: flex;
            flex-direction: column;
        }
        .meta-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
        }
        .media-container {
            width: 100%;
            text-align: center;
            margin-top: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            background: #ffffff;
            padding: 8px;
        }
        .media-container img {
            max-width: 100%;
            max-height: 750px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
        }
        .print-tip {
            font-size: 11px;
            color: #64748b;
            margin-top: 8px;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-brand">
            <img src="/images/smart-tech-icon.png" style="height: 36px; width: auto;" alt="Logo" />
            <div>
                <div class="clinic-title">Smart Tech <span style="color:#0284c7;">Medical Clinic</span></div>
                <div class="clinic-subtitle">Clinical Prescriptions & Diagnostic Records</div>
            </div>
        </div>
        <div>
            <span class="doc-badge">${category}</span>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-item">
            <span class="meta-label">Patient Name</span>
            <span class="meta-value">${patientName}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Patient Age</span>
            <span class="meta-value">${patientAge}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Blood Group</span>
            <span class="meta-value">${patientBloodGroup}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Attending Doctor</span>
            <span class="meta-value">${doctorName}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Clinical Service</span>
            <span class="meta-value">${lead.service || "—"}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Lead / File ID</span>
            <span class="meta-value">#${lead.id} / DOC-${doc.id}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value">${category}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Record Date</span>
            <span class="meta-value">${formattedDate}</span>
        </div>
    </div>

    ${mediaHtml}

    <div class="footer">
        <span>Confidential Medical Record — Smart Tech Clinic Management System</span>
        <span>Printed on: ${new Date().toLocaleString()}</span>
    </div>
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        if (!doc.isImage) {
            setTimeout(() => {
                printWindow.print();
            }, 800);
        }
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
                                {lead.age && (
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="size-3.5" />
                                        Age: {lead.age}
                                    </span>
                                )}
                                {lead.blood_group && (
                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                        <DropletIcon className="size-3.5 text-rose-500" />
                                        Blood Group: {lead.blood_group}
                                    </span>
                                )}
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer gap-1.5"
                                    >
                                        <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
                                        <span>Change Status</span>
                                        <ChevronDownIcon className="size-3 text-muted-foreground" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-52">
                                {(
                                    [
                                        "New patients",
                                        "Contacted patients",
                                        "Consultation Scheduled",
                                        "Follow up patients",
                                        "Confirmed patients",
                                        "Reschedule",
                                    ] as LeadStatus[]
                                ).map((st) => (
                                    <DropdownMenuItem
                                        key={st}
                                        onClick={() => handleStatusSelect(st)}
                                        className="text-xs cursor-pointer"
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

                        <BookAppointmentDialog
                            lockPatient
                            initialData={{
                                patientType: "existing",
                                patientId: lead.id,
                                patientName: lead.name,
                                phone: lead.phone,
                                email: lead.email,
                                service: lead.service,
                                doctor: lead.doctor,
                                notes: `Consultation appointment for lead #${lead.id} (${lead.service}).`,
                            }}
                            onSuccess={() => {
                                router.reload();
                            }}
                            trigger={
                                <Button
                                    size="sm"
                                    className="bg-primary text-primary-foreground cursor-pointer shadow-xs"
                                >
                                    <CalendarIcon className="size-3.5 mr-1.5" />
                                    Schedule an Appointment
                                </Button>
                            }
                        />
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
                                    Procedure details and total treatment value.
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
                                        Total Value
                                    </span>
                                    <span className="font-bold text-foreground text-sm tabular-nums">
                                        ₹{currentValue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <CreditCardIcon className="size-4" />
                                        Payment Status
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`font-medium ${getPaymentBadgeClass(currentPaymentStatus)}`}
                                    >
                                        {currentPaymentStatus}
                                    </Badge>
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

                                {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
                                    <>
                                        <div className="pt-2 pb-1 border-t mt-1">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Custom Intake Details
                                            </span>
                                        </div>
                                        {Object.entries(lead.custom_fields).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between py-1 border-b last:border-b-0">
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <TagIcon className="size-3.5 text-primary" />
                                                    {getFieldLabel(key)}
                                                </span>
                                                <span className="font-semibold text-foreground">
                                                    {String(val || "—")}
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Prescription & Diagnostic Upload Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <FileUpIcon className="size-4 text-primary" />
                                    Prescription & Diagnostics
                                </CardTitle>
                                <CardDescription>
                                    Attach diagnostic reports, X-rays, lab results, or prescription slips.
                                </CardDescription>
                            </CardHeader>
                            <div className="flex flex-col gap-3 px-4 pb-4">
                                <form onSubmit={handleUploadDocument} className="flex flex-col gap-3">
                                    {/* Field 1: Category Dropdown */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="prescription-category" className="text-xs font-medium">
                                            Prescription Category <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={prescriptionCategory}
                                            onValueChange={setPrescriptionCategory}
                                        >
                                            <SelectTrigger id="prescription-category" className="w-full text-xs h-8">
                                                <SelectValue placeholder="Select prescription type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="X-Ray" className="text-xs">
                                                        X-Ray
                                                    </SelectItem>
                                                    <SelectItem value="Blood Test" className="text-xs">
                                                        Blood Test
                                                    </SelectItem>
                                                    <SelectItem value="MRI / CT Scan" className="text-xs">
                                                        MRI / CT Scan
                                                    </SelectItem>
                                                    <SelectItem value="Ultrasound" className="text-xs">
                                                        Ultrasound
                                                    </SelectItem>
                                                    <SelectItem value="Lab Report" className="text-xs">
                                                        Lab Report
                                                    </SelectItem>
                                                    <SelectItem value="Medication Prescription" className="text-xs">
                                                        Medication Prescription
                                                    </SelectItem>
                                                    <SelectItem value="General Diagnostic" className="text-xs">
                                                        General Diagnostic
                                                    </SelectItem>
                                                    <SelectItem value="Other" className="text-xs">
                                                        Other
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Field 2: File Upload (Image or PDF) */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="prescription-file-input" className="text-xs font-medium">
                                            Upload Document <span className="text-destructive">*</span>
                                        </Label>
                                        <input
                                            ref={fileInputRef}
                                            id="prescription-file-input"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {!selectedFile ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors text-center"
                                            >
                                                <UploadCloudIcon className="size-5 text-muted-foreground" />
                                                <span className="text-xs font-medium text-foreground">
                                                    Choose an image or PDF
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    PNG, JPG, WEBP, or PDF up to 25MB
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {selectedFile.type === "application/pdf" ? (
                                                        <FileTextIcon className="size-5 text-rose-500 shrink-0" />
                                                    ) : (
                                                        <ImageIcon className="size-5 text-blue-500 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-foreground truncate">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 text-muted-foreground hover:text-destructive cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    <XIcon className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full text-xs h-8 cursor-pointer mt-1"
                                        disabled={!selectedFile || isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2Icon className="size-3 mr-1 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <PlusIcon className="size-3 mr-1" />
                                                Upload Prescription
                                            </>
                                        )}
                                    </Button>
                                </form>
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
                                        disabled={!newNote.trim() || isSavingNote}
                                    >
                                        <PlusIcon className="size-3 mr-1" />
                                        {isSavingNote ? "Saving..." : "Save Note"}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Tabs for Activities & Prescriptions */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <Tabs defaultValue="activity" className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <TabsList className="bg-muted/70 p-1 h-9">
                                    <TabsTrigger value="activity" className="text-xs gap-1.5 px-3">
                                        <ActivityIcon className="size-3.5" />
                                        <span>Activity & Consultation History</span>
                                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                                            {activities.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="prescriptions" className="text-xs gap-1.5 px-3">
                                        <FileTextIcon className="size-3.5" />
                                        <span>Prescriptions</span>
                                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                                            {activeDocuments.length}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab 1: Activity & Consultation History */}
                            <TabsContent value="activity" className="mt-0">
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
                            </TabsContent>

                            {/* Tab 2: Prescriptions Grid (3 in a row) */}
                            <TabsContent value="prescriptions" className="mt-0">
                                <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                                Prescriptions & Diagnostic Documents
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Diagnostic scans, lab tests, and clinical prescription files ({activeDocuments.length} records).
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="w-fit">
                                            {activeDocuments.length} Documents
                                        </Badge>
                                    </div>

                                    {activeDocuments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 border-dashed">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                                                <FileTextIcon className="size-6" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                No Prescriptions or Reports Uploaded
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                Use the upload form on the left to attach patient X-rays, lab reports, or medication prescriptions.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {activeDocuments.map((doc) => (
                                                <Card
                                                    key={doc.id}
                                                    className="overflow-hidden border shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all"
                                                >
                                                    <div className="p-3.5 flex flex-col gap-2.5">
                                                        {/* Header: Category Badge & Date */}
                                                        <div className="flex items-center justify-between gap-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={`font-medium text-[11px] truncate ${getCategoryBadgeClass(
                                                                    doc.category
                                                                )}`}
                                                            >
                                                                {doc.category}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                                                {new Date(
                                                                    doc.created_at
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* Preview Thumbnail */}
                                                        {doc.isImage ? (
                                                            <div
                                                                onClick={() =>
                                                                    handleOpenPreview(doc)
                                                                }
                                                                className="relative h-36 w-full rounded-md overflow-hidden bg-muted/40 cursor-pointer group flex items-center justify-center border"
                                                            >
                                                                <img
                                                                    src={doc.streamUrl}
                                                                    alt={doc.category}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                                                                    <EyeIcon className="size-3.5" />
                                                                    <span>Preview</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() =>
                                                                    handleOpenPreview(doc)
                                                                }
                                                                className="relative h-36 w-full rounded-md border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-3 flex flex-col items-center justify-center text-center cursor-pointer group"
                                                            >
                                                                <div className="size-11 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                                                    <FileTextIcon className="size-6" />
                                                                </div>
                                                                <span
                                                                    className="text-xs font-medium text-foreground line-clamp-1 w-full px-2"
                                                                    title={doc.original_name}
                                                                >
                                                                    {doc.original_name}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                                                    PDF Document • {doc.formattedSize}
                                                                </span>
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5 rounded-md">
                                                                    <EyeIcon className="size-3.5" />
                                                                    <span>Preview</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Document Metadata */}
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <p
                                                                className="text-xs font-medium text-foreground truncate"
                                                                title={doc.original_name}
                                                            >
                                                                {doc.original_name}
                                                            </p>
                                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                                <span>{doc.formattedSize}</span>
                                                                <span>
                                                                    {doc.uploader?.name
                                                                        ? `By ${doc.uploader.name}`
                                                                        : "By Staff"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Footer: Download & Print Buttons */}
                                                    <div className="border-t p-2.5 bg-muted/10 grid grid-cols-2 gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-8 gap-1 cursor-pointer"
                                                            render={
                                                                <a
                                                                    href={doc.downloadUrl}
                                                                    download={doc.original_name}
                                                                />
                                                            }
                                                        >
                                                            <DownloadIcon className="size-3.5" />
                                                            <span>Download</span>
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePrintDocument(doc)
                                                            }
                                                            className="text-xs h-8 gap-1 cursor-pointer"
                                                        >
                                                            <PrinterIcon className="size-3.5" />
                                                            <span>Print</span>
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Consultation Completed / Won Status Dialog */}
            <Dialog open={isWonDialogOpen} onOpenChange={setIsWonDialogOpen}>
                <DialogContent className="sm:max-w-md p-5 sm:p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <TrophyIcon className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                                    Consultation Completed — Confirmed Patient
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Record the final treatment amount and patient payment status for this consultation.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleWonSubmit} className="flex flex-col gap-4 mt-2">
                        {/* Procedure Amount */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="wonAmount" className="text-xs font-medium">
                                Total Amount (₹) <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <IndianRupeeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    id="wonAmount"
                                    type="number"
                                    min="0"
                                    step="50"
                                    required
                                    placeholder="Enter total treatment value"
                                    value={wonAmount}
                                    onChange={(e) => setWonAmount(e.target.value)}
                                    className="pl-8 text-xs h-8"
                                    autoFocus
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Final procedure or consultation fee billed to patient.
                            </p>
                        </div>

                        {/* Payment Status */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">
                                Payment Status <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={wonPaymentStatus}
                                onValueChange={(val) =>
                                    setWonPaymentStatus((val as PaymentStatus) || "Paid")
                                }
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Select payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Paid" className="text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-emerald-500" />
                                                Paid (Full payment received)
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="Partially Paid" className="text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-amber-500" />
                                                Partially Paid (Deposit / advance received)
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="Pending" className="text-xs">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-blue-500" />
                                                Pending (Awaiting invoice payment)
                                            </span>
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Optional Remarks */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="wonNotes" className="text-xs font-medium">
                                Clinical / Payment Remarks{" "}
                                <span className="text-muted-foreground text-[11px]">(Optional)</span>
                            </Label>
                            <Input
                                id="wonNotes"
                                type="text"
                                placeholder="e.g. Paid via UPI, digital scan completed, clear aligner kit ordered."
                                value={wonNotes}
                                onChange={(e) => setWonNotes(e.target.value)}
                                className="text-xs h-8"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t mt-1">
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8"
                                        disabled={isSavingWon}
                                    >
                                        Cancel
                                    </Button>
                                }
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingWon}
                                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                                {isSavingWon ? (
                                    "Saving..."
                                ) : (
                                    <>
                                        <CheckCircle2Icon className="size-3.5 mr-1.5" />
                                        Confirm Patient & Save
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Clinical Print Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileTextIcon className="size-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-semibold">
                                        Prescription & Diagnostic Record
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Clinical print preview stamped with patient identification.
                                    </DialogDescription>
                                </div>
                            </div>
                            {previewDoc && (
                                <Badge
                                    variant="outline"
                                    className={`font-medium ${getCategoryBadgeClass(previewDoc.category)}`}
                                >
                                    {previewDoc.category}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    {previewDoc && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Stamped Demographic Card */}
                            <div className="rounded-lg border bg-muted/20 p-4">
                                <div className="flex items-center justify-between border-b pb-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <BrandLogo size="xs" variant="auto" />
                                        <span className="text-xs font-bold tracking-tight uppercase">
                                            Smart Tech Medical Clinic
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                        DOC #{previewDoc.id} • Lead #{lead.id}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Patient Name
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {lead.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Age
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {lead.age ? `${lead.age} yrs` : "—"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Blood Group
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {lead.blood_group || lead.bloodGroup || "—"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Assigned Doctor
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {lead.doctor}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Service
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {lead.service}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Category
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {previewDoc.category}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            File Size
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {previewDoc.formattedSize}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                            Uploaded On
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {new Date(previewDoc.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Document Preview Canvas */}
                            <div className="rounded-lg border bg-card p-3 flex items-center justify-center min-h-[350px]">
                                {previewDoc.isImage ? (
                                    <img
                                        src={previewDoc.streamUrl}
                                        alt={previewDoc.category}
                                        className="max-h-[500px] w-auto max-w-full object-contain rounded"
                                    />
                                ) : (
                                    <iframe
                                        src={`${previewDoc.streamUrl}#toolbar=1`}
                                        className="w-full h-[500px] rounded border-0"
                                        title={previewDoc.original_name}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="px-6 py-3 border-t bg-muted/10 shrink-0 flex items-center justify-between sm:justify-between">
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 cursor-pointer"
                                >
                                    Close
                                </Button>
                            }
                        />
                        <div className="flex items-center gap-2">
                            {previewDoc && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 gap-1.5 cursor-pointer"
                                        render={
                                            <a
                                                href={previewDoc.downloadUrl}
                                                download={previewDoc.original_name}
                                            />
                                        }
                                    >
                                        <DownloadIcon className="size-3.5" />
                                        <span>Download</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() => handlePrintDocument(previewDoc)}
                                        className="text-xs h-8 gap-1.5 cursor-pointer"
                                    >
                                        <PrinterIcon className="size-3.5" />
                                        <span>Print Document</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
