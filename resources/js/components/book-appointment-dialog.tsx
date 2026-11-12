import * as React from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    StethoscopeIcon,
    UserIcon,
    PhoneIcon,
    MailIcon,
    FileTextIcon,
    CheckCircle2Icon,
    SparklesIcon,
    SearchIcon,
    UserCheckIcon,
    UserPlusIcon,
    RotateCcwIcon,
    Loader2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface BookAppointmentDialogInitialData {
    patientType?: "existing" | "new";
    patientId?: number;
    patientName?: string;
    phone?: string;
    email?: string;
    service?: string;
    doctor?: string;
    notes?: string;
}

export interface BookAppointmentDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialData?: BookAppointmentDialogInitialData;
    onSuccess?: () => void;
}

export const CLINIC_SERVICES = [
    {
        title: "Dental Implants & Cosmetic",
        doctor: "Dr. Eddie Lake",
        badge: "Dentistry",
    },
    {
        title: "Orthodontics & Clear Aligners",
        doctor: "Dr. Jamik Tashpulatov",
        badge: "Orthodontics",
    },
    {
        title: "Cardiology Checkup & ECG",
        doctor: "Dr. Emily Whalen",
        badge: "Cardiology",
    },
    {
        title: "General & Preventative Care",
        doctor: "Dr. Eddie Lake",
        badge: "General Care",
    },
];

export const CLINIC_DOCTORS = [
    {
        name: "Dr. Eddie Lake",
        specialty: "Dental Surgeon & Implant Specialist",
    },
    {
        name: "Dr. Jamik Tashpulatov",
        specialty: "Orthodontist & Clear Aligner Specialist",
    },
    {
        name: "Dr. Emily Whalen",
        specialty: "Consultant Cardiologist",
    },
];

export const APPOINTMENT_TIME_SLOTS = [
    { time: "09:00 AM", period: "Morning" },
    { time: "10:00 AM", period: "Morning" },
    { time: "11:00 AM", period: "Morning" },
    { time: "01:30 PM", period: "Afternoon" },
    { time: "02:30 PM", period: "Afternoon" },
    { time: "03:30 PM", period: "Afternoon" },
    { time: "04:30 PM", period: "Evening" },
    { time: "05:30 PM", period: "Evening" },
];

function getLocalDateString(offsetDays = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function normalizeTime(t: string): string {
    return t.replace(/\s+/g, "").toUpperCase();
}

export function parseTimeToMinutes(timeStr: string): number {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return -1;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours < 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

export function isSlotPast(timeStr: string, dateStr: string): boolean {
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = String(now.getMonth() + 1).padStart(2, "0");
    const todayD = String(now.getDate()).padStart(2, "0");
    const todayStr = `${todayY}-${todayM}-${todayD}`;

    const effectiveDate = dateStr === "Today" ? todayStr : dateStr;

    // Past date (e.g. yesterday)
    if (effectiveDate < todayStr) {
        return true;
    }

    // Future date (e.g. tomorrow)
    if (effectiveDate > todayStr) {
        return false;
    }

    // Today: check if slot time has arrived or passed
    const slotMinutes = parseTimeToMinutes(timeStr);
    if (slotMinutes === -1) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= currentMinutes;
}

export interface ExistingPatientItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    service?: string;
    doctor?: string;
    status?: string;
    value?: number;
    notes?: string;
}

export function BookAppointmentDialog({
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    initialData,
    onSuccess,
}: BookAppointmentDialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    const { auth, clinicDoctors } = usePage().props as unknown as {
        auth?: {
            user?: { role?: string; name?: string; email?: string };
            doctor?: { id?: number; name?: string; specialty?: string };
            role?: string;
        };
        clinicDoctors?: Array<{ id: number; name: string; specialty: string; room?: string }>;
    };

    const isDoctor = auth?.user?.role === "doctor" && !!auth?.doctor;
    const availableDoctors = clinicDoctors && clinicDoctors.length > 0
        ? clinicDoctors.map((d) => ({ name: d.name, specialty: d.specialty }))
        : CLINIC_DOCTORS;

    const initialDoctor = isDoctor && auth?.doctor?.name
        ? auth.doctor.name
        : (availableDoctors[0]?.name || CLINIC_SERVICES[0].doctor);

    const todayStr = getLocalDateString(0);

    const [patientType, setPatientType] = React.useState<"existing" | "new">(
        initialData?.patientType || "existing"
    );
    const [existingPatients, setExistingPatients] = React.useState<ExistingPatientItem[]>([]);
    const [isLoadingPatients, setIsLoadingPatients] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState(
        initialData?.patientName || ""
    );
    const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(
        initialData?.patientId ?? null
    );
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownContainerRef = React.useRef<HTMLDivElement>(null);

    const [patientName, setPatientName] = React.useState(
        initialData?.patientName || ""
    );
    const [phone, setPhone] = React.useState(initialData?.phone || "");
    const [email, setEmail] = React.useState(initialData?.email || "");
    const [service, setService] = React.useState(
        initialData?.service || CLINIC_SERVICES[0].title
    );
    const [doctor, setDoctor] = React.useState(
        initialData?.doctor || initialDoctor
    );
    const [date, setDate] = React.useState(todayStr);
    const [timeSlot, setTimeSlot] = React.useState(() => {
        const firstOpen = APPOINTMENT_TIME_SLOTS.find(
            (s) => !isSlotPast(s.time, todayStr)
        );
        return firstOpen ? firstOpen.time : "";
    });
    const [notes, setNotes] = React.useState(initialData?.notes || "");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [bookedSlots, setBookedSlots] = React.useState<
        Array<{ doctor: string; date: string; time: string; status: string }>
    >([]);

    // Load existing patients from API when dialog opens
    React.useEffect(() => {
        if (!open) return;

        let isMounted = true;
        const fetchPatients = async () => {
            setIsLoadingPatients(true);
            try {
                const res = await fetch("/api/patients");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && Array.isArray(data.patients)) {
                        setExistingPatients(data.patients);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch existing patients", err);
            } finally {
                if (isMounted) setIsLoadingPatients(false);
            }
        };

        fetchPatients();
        return () => {
            isMounted = false;
        };
    }, [open]);

    // Sync initialData whenever dialog opens or initialData changes
    React.useEffect(() => {
        if (!open) return;
        if (initialData) {
            if (initialData.patientType) setPatientType(initialData.patientType);
            if (initialData.patientId !== undefined) setSelectedPatientId(initialData.patientId);
            if (initialData.patientName) {
                setPatientName(initialData.patientName);
                setSearchQuery(initialData.patientName);
            }
            if (initialData.phone) setPhone(initialData.phone);
            if (initialData.email !== undefined) setEmail(initialData.email);
            if (initialData.service) setService(initialData.service);
            if (initialData.doctor) setDoctor(initialData.doctor);
            if (initialData.notes !== undefined) setNotes(initialData.notes);
        }
    }, [open, initialData]);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownContainerRef.current &&
                !dropdownContainerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filter patients based on search query
    const filteredPatients = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return existingPatients.slice(0, 10);
        }
        const q = searchQuery.toLowerCase().trim();
        return existingPatients.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.phone.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                (p.service && p.service.toLowerCase().includes(q))
        );
    }, [existingPatients, searchQuery]);

    const selectedPatient = React.useMemo(() => {
        if (!selectedPatientId) return null;
        const found = existingPatients.find((p) => p.id === selectedPatientId);
        if (found) return found;
        if (patientName) {
            return {
                id: selectedPatientId,
                name: patientName,
                phone: phone,
                email: email,
                service: service,
                doctor: doctor,
            } as ExistingPatientItem;
        }
        return null;
    }, [existingPatients, selectedPatientId, patientName, phone, email, service, doctor]);

    const handleSelectPatient = (patient: ExistingPatientItem) => {
        setSelectedPatientId(patient.id);
        setPatientName(patient.name);
        setPhone(patient.phone);
        setEmail(patient.email);
        setIsDropdownOpen(false);
        setSearchQuery("");

        if (patient.service && CLINIC_SERVICES.some((s) => s.title === patient.service)) {
            setService(patient.service);
            const match = CLINIC_SERVICES.find((s) => s.title === patient.service);
            if (match) {
                setDoctor(match.doctor);
            }
        } else if (patient.doctor && CLINIC_DOCTORS.some((d) => d.name === patient.doctor)) {
            setDoctor(patient.doctor);
        }
    };

    // Load current booked slots from API when dialog opens
    React.useEffect(() => {
        if (!open) return;

        let isMounted = true;
        const fetchBooked = async () => {
            try {
                const res = await fetch("/api/appointments/booked-slots");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && Array.isArray(data.slots)) {
                        setBookedSlots(data.slots);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch booked slots", err);
            }
        };

        fetchBooked();
        return () => {
            isMounted = false;
        };
    }, [open]);

    // Check if slot is booked
    const checkIsSlotBooked = React.useCallback(
        (slotTime: string, targetDoctor: string, targetDate: string) => {
            const tomorrowStr = getLocalDateString(1);

            return bookedSlots.some((s) => {
                if (s.status === "Cancelled") return false;
                if (s.doctor.toLowerCase() !== targetDoctor.toLowerCase()) return false;
                if (normalizeTime(s.time) !== normalizeTime(slotTime)) return false;

                if (s.date === "Today" && targetDate === todayStr) return true;
                if (s.date === "Tomorrow" && targetDate === tomorrowStr) return true;
                if (s.date === targetDate) return true;

                try {
                    const selectedObj = new Date(targetDate);
                    const slotObj = new Date(`${s.date} ${new Date().getFullYear()}`);
                    if (
                        !isNaN(selectedObj.getTime()) &&
                        !isNaN(slotObj.getTime()) &&
                        slotObj.getMonth() === selectedObj.getMonth() &&
                        slotObj.getDate() === selectedObj.getDate()
                    ) {
                        return true;
                    }
                } catch {
                    // ignore
                }

                return false;
            });
        },
        [bookedSlots, todayStr]
    );

    // When service changes, auto-select corresponding default specialist
    const handleServiceChange = (newService: string) => {
        setService(newService);
        const match = CLINIC_SERVICES.find((s) => s.title === newService);
        if (match) {
            setDoctor(match.doctor);
        }
    };

    // Auto-select first available upcoming time slot if current becomes booked or has passed
    React.useEffect(() => {
        const isCurrentInvalid =
            !timeSlot ||
            isSlotPast(timeSlot, date) ||
            checkIsSlotBooked(timeSlot, doctor, date);

        if (isCurrentInvalid) {
            const firstOpen = APPOINTMENT_TIME_SLOTS.find(
                (s) =>
                    !isSlotPast(s.time, date) &&
                    !checkIsSlotBooked(s.time, doctor, date)
            );
            setTimeSlot(firstOpen ? firstOpen.time : "");
        }
    }, [doctor, date, timeSlot, checkIsSlotBooked, open]);

    const resetForm = () => {
        if (initialData) {
            setPatientType(initialData.patientType || "existing");
            setSelectedPatientId(initialData.patientId ?? null);
            setSearchQuery(initialData.patientName || "");
            setIsDropdownOpen(false);
            setPatientName(initialData.patientName || "");
            setPhone(initialData.phone || "");
            setEmail(initialData.email || "");
            setService(initialData.service || CLINIC_SERVICES[0].title);
            setDoctor(initialData.doctor || initialDoctor);
            setDate(todayStr);
            const firstOpen = APPOINTMENT_TIME_SLOTS.find(
                (s) => !isSlotPast(s.time, todayStr)
            );
            setTimeSlot(firstOpen ? firstOpen.time : "");
            setNotes(initialData.notes || "");
        } else {
            setPatientType("existing");
            setSelectedPatientId(null);
            setSearchQuery("");
            setIsDropdownOpen(false);
            setPatientName("");
            setPhone("");
            setEmail("");
            setService(CLINIC_SERVICES[0].title);
            setDoctor(initialDoctor);
            setDate(todayStr);
            const firstOpen = APPOINTMENT_TIME_SLOTS.find(
                (s) => !isSlotPast(s.time, todayStr)
            );
            setTimeSlot(firstOpen ? firstOpen.time : "");
            setNotes("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (patientType === "existing" && !patientName.trim()) {
            toast.error("Please search and select an existing patient");
            setIsDropdownOpen(true);
            return;
        }

        if (!patientName.trim()) {
            toast.error("Please enter the patient's full name");
            return;
        }

        if (!phone.trim()) {
            toast.error("Please enter the patient's phone number");
            return;
        }

        if (!date) {
            toast.error("Please select an appointment date");
            return;
        }

        if (!timeSlot) {
            toast.error("Please select an available upcoming time slot");
            return;
        }

        if (isSlotPast(timeSlot, date)) {
            toast.error(
                `The ${timeSlot} slot has already passed for today. Please select an upcoming time slot.`
            );
            return;
        }

        if (checkIsSlotBooked(timeSlot, doctor, date)) {
            toast.error(
                `The ${timeSlot} slot is already booked for ${doctor}. Please choose another slot.`
            );
            return;
        }

        setIsSubmitting(true);

        const dateFormatted =
            date === getLocalDateString(0)
                ? "Today"
                : date === getLocalDateString(1)
                ? "Tomorrow"
                : date;

        const patientEmail =
            email.trim() ||
            `${patientName.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`;

        try {
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    patientName: patientName.trim(),
                    patientEmail,
                    patientPhone: phone.trim(),
                    service,
                    doctor,
                    date: dateFormatted,
                    time: timeSlot,
                    leadId: selectedPatientId || undefined,
                    notes: notes.trim() || "Booked by clinic staff via dashboard.",
                    source: "Staff Booking",
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server returned ${response.status}`);
            }

            toast.success("Appointment Booked Successfully!", {
                description: `${patientName.trim()} scheduled with ${doctor} for ${dateFormatted} at ${timeSlot}. Saved to database.`,
            });

            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("medi_appointments_updated"));
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.reload({ only: ["appointments", "pendingAppointments", "metrics"] });
            }
            setOpen(false);
            resetForm();
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error("Failed to book appointment", {
                description: error.message || "Please check your network and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger render={trigger as React.ReactElement} />
            ) : (
                <DialogTrigger
                    render={
                        <Button
                            size="sm"
                            className="bg-primary text-primary-foreground cursor-pointer shadow-xs"
                        >
                            <PlusIcon className="size-4 mr-1" />
                            Book as Patient
                        </Button>
                    }
                />
            )}

            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <StethoscopeIcon className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                                Book Patient Appointment
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Schedule a patient consultation directly from the clinic dashboard.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    {/* Patient Type Selection: Existing Patient vs New Patient */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                            Patient Registration Status <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setPatientType("existing");
                                    if (!selectedPatientId) {
                                        setIsDropdownOpen(true);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition-all text-left cursor-pointer",
                                    patientType === "existing"
                                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                                        : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                                        patientType === "existing"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <UserCheckIcon className="size-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground text-xs">Existing Patient</div>
                                    <div className="text-[10px] text-muted-foreground leading-tight">Search & select from records</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPatientType("new");
                                    setSelectedPatientId(null);
                                    setPatientName("");
                                    setPhone("");
                                    setEmail("");
                                    setIsDropdownOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition-all text-left cursor-pointer",
                                    patientType === "new"
                                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                                        : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                                        patientType === "new"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <UserPlusIcon className="size-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground text-xs">New Patient</div>
                                    <div className="text-[10px] text-muted-foreground leading-tight">Register new patient details</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Existing Patient Search Section */}
                    {patientType === "existing" && (
                        <div
                            ref={dropdownContainerRef}
                            className="flex flex-col gap-2.5 rounded-lg border bg-muted/20 p-3"
                        >
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-foreground">
                                    Search Existing Patient <span className="text-destructive">*</span>
                                </Label>
                                {selectedPatient && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedPatientId(null);
                                            setPatientName("");
                                            setPhone("");
                                            setEmail("");
                                            setIsDropdownOpen(true);
                                        }}
                                        className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                    >
                                        <RotateCcwIcon className="size-3" />
                                        Select Different Patient
                                    </button>
                                )}
                            </div>

                            {selectedPatient ? (
                                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                            {selectedPatient.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {selectedPatient.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] py-0 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                                >
                                                    Existing Patient Record
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <PhoneIcon className="size-3" />
                                                    {selectedPatient.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MailIcon className="size-3" />
                                                    {selectedPatient.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPatientId(null);
                                            setIsDropdownOpen(true);
                                        }}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                        <Input
                                            type="text"
                                            placeholder="Search patient by name, phone number, or email..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            className="pl-8 text-xs h-8.5 bg-background shadow-xs"
                                        />
                                        {isLoadingPatients && (
                                            <Loader2Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground animate-spin" />
                                        )}
                                    </div>

                                    {/* Dropdown Options List with Search Results */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg text-popover-foreground">
                                            {filteredPatients.length === 0 ? (
                                                <div className="p-3 text-center text-xs text-muted-foreground">
                                                    {isLoadingPatients
                                                        ? "Loading clinic records..."
                                                        : searchQuery.trim()
                                                        ? `No patients found matching "${searchQuery}".`
                                                        : "No existing patients registered yet."}
                                                    {!isLoadingPatients && (
                                                        <div className="mt-2 pt-2 border-t border-border/40">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPatientType("new");
                                                                    setPatientName(searchQuery.trim());
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className="text-primary text-xs hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <UserPlusIcon className="size-3" />
                                                                Register "{searchQuery.trim() || "New"}" as a new patient instead
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                        Select Patient ({filteredPatients.length} found)
                                                    </div>
                                                    {filteredPatients.map((patient) => (
                                                        <button
                                                            key={patient.id}
                                                            type="button"
                                                            onClick={() => handleSelectPatient(patient)}
                                                            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/80 text-left transition-colors cursor-pointer text-xs group"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px] group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                                    {patient.name
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("")
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-foreground">
                                                                        {patient.name}
                                                                    </div>
                                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                                                        <span>{patient.phone}</span>
                                                                        <span>•</span>
                                                                        <span>{patient.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {patient.service && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] shrink-0 font-normal"
                                                                >
                                                                    {patient.service}
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Patient Details Section */}
                    {patientType === "new" && (
                        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3">
                            <Label className="text-xs font-medium text-foreground">
                                New Patient Details <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="patientName" className="text-xs font-medium">
                                        Patient Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="patientName"
                                            type="text"
                                            required={patientType === "new"}
                                            placeholder="e.g. John Doe"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            className="pl-8 text-xs h-8 bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="phone" className="text-xs font-medium">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            required={patientType === "new"}
                                            placeholder="e.g. +91 98765 43210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="pl-8 text-xs h-8 bg-background"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email" className="text-xs font-medium">
                                    Email Address <span className="text-muted-foreground text-[11px]">(Optional)</span>
                                </Label>
                                <div className="relative">
                                    <MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="patient@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-8 text-xs h-8 bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service & Specialist Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-medium">
                                Clinical Service <span className="text-destructive">*</span>
                            </Label>
                            <Select value={service} onValueChange={(val) => handleServiceChange(val ?? CLINIC_SERVICES[0].title)}>
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Select clinical service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {CLINIC_SERVICES.map((s) => (
                                            <SelectItem key={s.title} value={s.title} className="text-xs">
                                                {s.title}
                                            </SelectItem>
                                        ))}
                                        {!CLINIC_SERVICES.some((s) => s.title === service) && service && (
                                            <SelectItem value={service} className="text-xs">
                                                {service}
                                            </SelectItem>
                                        )}
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
                                onValueChange={(val) => setDoctor(val ?? availableDoctors[0].name)}
                                disabled={isDoctor}
                            >
                                <SelectTrigger className="w-full text-xs h-8">
                                    <SelectValue placeholder="Select specialist" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {availableDoctors.map((d) => (
                                            <SelectItem key={d.name} value={d.name} className="text-xs">
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                        {!availableDoctors.some((d) => d.name === doctor) && doctor && (
                                            <SelectItem value={doctor} className="text-xs">
                                                {doctor}
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {isDoctor && (
                                <span className="text-[10px] text-muted-foreground">
                                    Assigned to your specialist profile
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="date" className="text-xs font-medium">
                            Appointment Date <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                id="date"
                                type="date"
                                required
                                min={todayStr}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-8 text-xs h-8"
                            />
                        </div>
                    </div>

                    {/* Visual Slot Picker */}
                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <ClockIcon className="size-3.5 text-primary" />
                                <span>Time Slot for {doctor.replace("Dr. ", "Dr. ")}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {
                                    APPOINTMENT_TIME_SLOTS.filter(
                                        (s) =>
                                            !isSlotPast(s.time, date) &&
                                            !checkIsSlotBooked(s.time, doctor, date)
                                    ).length
                                }{" "}
                                slots open
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {APPOINTMENT_TIME_SLOTS.map((slot) => {
                                const isPast = isSlotPast(slot.time, date);
                                const isBooked = checkIsSlotBooked(slot.time, doctor, date);
                                const isSelected = timeSlot === slot.time;

                                if (isPast) {
                                    return (
                                        <div
                                            key={slot.time}
                                            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md border border-dashed border-border/60 bg-muted/20 text-muted-foreground/40 text-[11px] cursor-not-allowed select-none"
                                            title={`${slot.time} has already passed for today`}
                                        >
                                            <span className="line-through">{slot.time}</span>
                                            <span className="text-[9px] text-muted-foreground/60 font-medium">Passed</span>
                                        </div>
                                    );
                                }

                                if (isBooked) {
                                    return (
                                        <div
                                            key={slot.time}
                                            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md border border-dashed border-border/80 bg-muted/40 text-muted-foreground/60 text-[11px] cursor-not-allowed select-none"
                                            title={`${slot.time} is already booked`}
                                        >
                                            <span className="line-through">{slot.time}</span>
                                            <span className="text-[9px] text-rose-500 font-medium flex items-center gap-1">
                                                <span className="size-1 rounded-full bg-rose-500" />
                                                Booked
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() => setTimeSlot(slot.time)}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-1.5 px-1 rounded-md border text-[11px] font-medium transition-all cursor-pointer",
                                            isSelected
                                                ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                                                : "bg-background hover:bg-muted/60 text-foreground border-border"
                                        )}
                                    >
                                        <span>{slot.time}</span>
                                        <span
                                            className={cn(
                                                "text-[9px] font-normal",
                                                isSelected
                                                    ? "text-primary-foreground/90 font-medium"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            )}
                                        >
                                            Available
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 gap-2">
                            <span className="flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Available
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Booked
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                                Time Passed
                            </span>
                        </div>
                    </div>

                    {/* Reason / Notes */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="notes" className="text-xs font-medium">
                            Clinical Notes / Symptoms{" "}
                            <span className="text-muted-foreground text-[11px]">(Optional)</span>
                        </Label>
                        <Input
                            id="notes"
                            type="text"
                            placeholder="e.g. Patient requested morning consultation for dental implant evaluation."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
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
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            }
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="text-xs h-8 bg-primary text-primary-foreground shadow-xs"
                        >
                            {isSubmitting ? (
                                "Booking..."
                            ) : (
                                <>
                                    <CheckCircle2Icon className="size-3.5 mr-1.5" />
                                    Confirm & Book Appointment
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
