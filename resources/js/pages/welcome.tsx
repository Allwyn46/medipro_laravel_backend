import * as React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    CalendarIcon,
    ClockIcon,
    StethoscopeIcon,
    CheckCircle2Icon,
    ShieldCheckIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    UserIcon,
    ArrowRightIcon,
    StarIcon,
    SparklesIcon,
    HeartPulseIcon,
    Building2Icon,
    UsersIcon,
    ActivityIcon,
    AlertCircleIcon,
    BanIcon,
    CheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";

const ALL_TIME_SLOTS = [
    { time: "09:00 AM", period: "Morning" },
    { time: "09:30 AM", period: "Morning" },
    { time: "10:00 AM", period: "Morning" },
    { time: "11:00 AM", period: "Late Morning" },
    { time: "11:30 AM", period: "Late Morning" },
    { time: "01:30 PM", period: "Early Afternoon" },
    { time: "02:00 PM", period: "Afternoon" },
    { time: "02:15 PM", period: "Afternoon" },
    { time: "03:00 PM", period: "Afternoon" },
    { time: "03:45 PM", period: "Late Afternoon" },
    { time: "04:00 PM", period: "Late Afternoon" },
    { time: "04:15 PM", period: "Late Afternoon" },
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

function normalizeTime(time: string): string {
    if (!time) return "";
    return time.trim().replace(/^0/, "").replace(/\s+/g, " ").toUpperCase();
}

function isSameDate(aptDate: string, selectedDate: string): boolean {
    if (!aptDate || !selectedDate) return false;

    if (aptDate.toLowerCase() === selectedDate.toLowerCase()) return true;

    const todayStr = getLocalDateString(0);
    const tomorrowStr = getLocalDateString(1);

    if (aptDate === "Today" && selectedDate === todayStr) return true;
    if (aptDate === "Tomorrow" && selectedDate === tomorrowStr) return true;

    try {
        const selectedObj = new Date(selectedDate);
        if (!isNaN(selectedObj.getTime())) {
            const currentYear = new Date().getFullYear();
            const aptObj = new Date(`${aptDate} ${currentYear}`);
            if (
                !isNaN(aptObj.getTime()) &&
                aptObj.getMonth() === selectedObj.getMonth() &&
                aptObj.getDate() === selectedObj.getDate()
            ) {
                return true;
            }
        }
    } catch {
        // ignore
    }

    return false;
}

const SERVICES = [
    {
        title: "Dental Implants & Cosmetic",
        doctor: "Dr. Eddie Lake",
        icon: StethoscopeIcon,
        description:
            "Full-arch implants, smile makeover, porcelain veneers, and teeth whitening.",
        badge: "Dentistry",
    },
    {
        title: "Orthodontics & Clear Aligners",
        doctor: "Dr. Jamik Tashpulatov",
        icon: SparklesIcon,
        description:
            "3D digital scans, transparent aligners, bite correction, and retainers.",
        badge: "Orthodontics",
    },
    {
        title: "Cardiology & Heart Health",
        doctor: "Dr. Emily Whalen",
        icon: HeartPulseIcon,
        description:
            "Cardiac stress tests, ECG, blood pressure management, and lipid care.",
        badge: "Cardiology",
    },
    {
        title: "Dermatology & Laser Therapy",
        doctor: "Dr. Eddie Lake",
        icon: ActivityIcon,
        description:
            "Advanced laser resurfacing, skin therapy, acne treatments, and screenings.",
        badge: "Dermatology",
    },
    {
        title: "Orthopedics & Joint Clinic",
        doctor: "Dr. Emily Whalen",
        icon: ShieldCheckIcon,
        description:
            "Arthroscopy assessments, meniscus treatment, joint pain, and sports medicine.",
        badge: "Orthopedics",
    },
    {
        title: "Executive Health Screening",
        doctor: "Dr. Jamik Tashpulatov",
        icon: Building2Icon,
        description:
            "Full-body checkups, comprehensive pathology diagnostics, and wellness plans.",
        badge: "General Health",
    },
];

export default function Welcome({
    bookedSlots = [],
}: {
    bookedSlots?: Appointment[];
}) {
    const { auth } = usePage<{ auth?: { user?: { name: string } } }>().props;

    const [formSubmitted, setFormSubmitted] = React.useState(false);

    const [confirmedAppointments, setConfirmedAppointments] = React.useState<
        Appointment[]
    >(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("medi_confirmed_appointments");
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error("Failed to parse confirmed appointments", e);
                }
            }
        }
        return bookedSlots;
    });

    const [pendingAppointments, setPendingAppointments] = React.useState<
        Appointment[]
    >(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("medi_pending_appointments");
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error("Failed to parse pending appointments", e);
                }
            }
        }
        return [];
    });

    React.useEffect(() => {
        if (bookedSlots.length > 0 && !localStorage.getItem("medi_confirmed_appointments")) {
            setConfirmedAppointments(bookedSlots);
        }
    }, [bookedSlots]);

    // Sync with storage events from dashboard confirmations
    React.useEffect(() => {
        const handleSync = () => {
            if (typeof window !== "undefined") {
                const storedConf = localStorage.getItem(
                    "medi_confirmed_appointments",
                );
                if (storedConf) {
                    try {
                        setConfirmedAppointments(JSON.parse(storedConf));
                    } catch (e) {
                        console.error(e);
                    }
                }
                const storedPend = localStorage.getItem(
                    "medi_pending_appointments",
                );
                if (storedPend) {
                    try {
                        setPendingAppointments(JSON.parse(storedPend));
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        };

        window.addEventListener("medi_appointments_updated", handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            window.removeEventListener("medi_appointments_updated", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, []);

    const getBookedInfo = React.useCallback(
        (timeSlot: string, doctor: string, date: string) => {
            if (!timeSlot || !doctor || !date) {
                return { isBooked: false, patientName: "", status: "" };
            }

            // Check confirmed clinic schedule (including Confirmed, In Progress, Scheduled)
            const confirmedMatch = confirmedAppointments.find((apt) => {
                if (apt.status === "Cancelled") return false;
                if (apt.doctor.toLowerCase() !== doctor.toLowerCase())
                    return false;
                if (!isSameDate(apt.date, date)) return false;
                return normalizeTime(apt.time) === normalizeTime(timeSlot);
            });

            if (confirmedMatch) {
                return {
                    isBooked: true,
                    patientName: confirmedMatch.patientName,
                    status: confirmedMatch.status,
                };
            }

            // Check pending requests to prevent double-booking
            const pendingMatch = pendingAppointments.find((apt) => {
                if (apt.status === "Cancelled") return false;
                if (apt.doctor.toLowerCase() !== doctor.toLowerCase())
                    return false;
                if (!isSameDate(apt.date, date)) return false;
                return normalizeTime(apt.time) === normalizeTime(timeSlot);
            });

            if (pendingMatch) {
                return {
                    isBooked: true,
                    patientName: pendingMatch.patientName,
                    status: "Pending",
                };
            }

            return { isBooked: false, patientName: "", status: "" };
        },
        [confirmedAppointments, pendingAppointments],
    );

    const [bookingData, setBookingData] = React.useState(() => {
        const todayStr = getLocalDateString(0);
        const defaultDoctor = "Dr. Eddie Lake";
        const initialSlot =
            ALL_TIME_SLOTS.find((s) => {
                return !bookedSlots.some(
                    (apt) =>
                        apt.status !== "Cancelled" &&
                        apt.doctor.toLowerCase() ===
                            defaultDoctor.toLowerCase() &&
                        (apt.date === "Today" || apt.date === todayStr) &&
                        normalizeTime(apt.time) === normalizeTime(s.time),
                );
            })?.time || "09:00 AM";

        return {
            patientName: "",
            email: "",
            phone: "",
            service: "Dental Implants & Cosmetic",
            doctor: defaultDoctor,
            date: todayStr,
            timeSlot: initialSlot,
            notes: "",
        };
    });

    // Auto-select first available slot if currently selected slot becomes booked
    React.useEffect(() => {
        const currentCheck = getBookedInfo(
            bookingData.timeSlot,
            bookingData.doctor,
            bookingData.date,
        );
        if (currentCheck.isBooked) {
            const firstAvailable = ALL_TIME_SLOTS.find(
                (s) =>
                    !getBookedInfo(s.time, bookingData.doctor, bookingData.date)
                        .isBooked,
            );
            if (firstAvailable) {
                setBookingData((prev) => ({
                    ...prev,
                    timeSlot: firstAvailable.time,
                }));
            }
        }
    }, [
        bookingData.doctor,
        bookingData.date,
        getBookedInfo,
        bookingData.timeSlot,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !bookingData.patientName ||
            !bookingData.phone ||
            !bookingData.date
        ) {
            alert(
                "Please fill in your name, phone number, and preferred date.",
            );
            return;
        }

        const bookedCheck = getBookedInfo(
            bookingData.timeSlot,
            bookingData.doctor,
            bookingData.date,
        );
        if (bookedCheck.isBooked) {
            alert(
                `The time slot ${bookingData.timeSlot} is already booked for ${bookingData.doctor} on this date. Please select an available slot.`,
            );
            return;
        }

        const dateFormatted =
            bookingData.date === getLocalDateString(0)
                ? "Today"
                : bookingData.date === getLocalDateString(1)
                  ? "Tomorrow"
                  : bookingData.date;

        const newBooking: Appointment = {
            id: Date.now(),
            patientName: bookingData.patientName.trim(),
            patientEmail:
                bookingData.email.trim() ||
                `${bookingData.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            patientPhone: bookingData.phone.trim(),
            service: bookingData.service,
            doctor: bookingData.doctor,
            date: dateFormatted,
            time: bookingData.timeSlot,
            dateTimeFormatted: `${dateFormatted} at ${bookingData.timeSlot}`,
            status: "Pending",
            type: "Initial Consultation",
            room: "Consultation Suite 1",
            duration: "45 mins",
            notes:
                bookingData.notes.trim() ||
                "Booked online via Medi Pro patient portal.",
            source: "Website Booking",
            requestedAt: "Just now",
        };

        try {
            await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    patientName: newBooking.patientName,
                    patientEmail: newBooking.patientEmail,
                    patientPhone: newBooking.patientPhone,
                    service: newBooking.service,
                    doctor: newBooking.doctor,
                    date: newBooking.date,
                    time: newBooking.time,
                    notes: newBooking.notes,
                    source: "Website Booking",
                }),
            });
        } catch (error) {
            console.error("Failed to save booking to database", error);
        }

        try {
            const stored = localStorage.getItem("medi_pending_appointments");
            const existingList: Appointment[] = stored ? JSON.parse(stored) : [];
            const updated = [newBooking, ...existingList];
            localStorage.setItem(
                "medi_pending_appointments",
                JSON.stringify(updated),
            );
            window.dispatchEvent(new Event("medi_appointments_updated"));
        } catch (error) {
            console.error("Failed to save booking to localStorage", error);
        }

        setFormSubmitted(true);
    };

    return (
        <>
            <Head title="Book an Appointment" />

            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <StethoscopeIcon className="size-5" />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight text-foreground">
                                    Medi Pro
                                </span>
                                {/* <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground border-l pl-2">
                                    Specialist Medical Clinic
                                </span> */}
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium font-sans tracking-tight text-muted-foreground">
                            <a
                                href="#booking"
                                className="hover:text-foreground transition-colors"
                            >
                                Book Appointment
                            </a>
                            <a
                                href="#services"
                                className="hover:text-foreground transition-colors"
                            >
                                Medical Services
                            </a>
                            <a
                                href="#specialists"
                                className="hover:text-foreground transition-colors"
                            >
                                Our Specialists
                            </a>
                            <a
                                href="#contact"
                                className="hover:text-foreground transition-colors"
                            >
                                Contact & Hours
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                render={<a href="#booking" />}
                                className="bg-primary text-primary-foreground font-semibold shadow-xs"
                            >
                                <CalendarIcon className="size-3.5 mr-1.5" />
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 via-background to-background py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Left Text */}
                            <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
                                <div className="inline-flex items-center justify-center lg:justify-start">
                                    <Badge
                                        variant="outline"
                                        className="px-3 py-1 gap-1.5 text-xs font-medium border-primary/20 bg-primary/5 text-primary"
                                    >
                                        <SparklesIcon className="size-3.5" />
                                        Accepting New Patients Today
                                    </Badge>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium font-sans tracking-tight text-foreground leading-[1.1]">
                                    World-class clinical care, personalized for
                                    you.
                                </h1>

                                <p className="text-base sm:text-lg font-sans tracking-tight text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    Book an appointment with board-certified
                                    physicians, dentists, and surgeons.
                                    Experience modern diagnostics, zero waiting
                                    times, and compassionate healthcare.
                                </p>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                                    <Button
                                        size="lg"
                                        className="bg-primary text-primary-foreground h-12 px-6 text-sm font-semibold shadow-md"
                                        render={<a href="#booking" />}
                                    >
                                        <CalendarIcon className="size-4 mr-2" />
                                        Schedule Consultation
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-12 px-6 text-sm"
                                        render={<a href="#services" />}
                                    >
                                        Explore Procedures
                                    </Button>
                                </div>

                                {/* Trust stats */}
                                <div className="grid grid-cols-3 gap-4 pt-6 border-t max-w-lg mx-auto lg:mx-0 text-left">
                                    <div>
                                        <div className="text-2xl font-bold text-foreground tabular-nums">
                                            4.9/5
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                                            1,200+ Reviews
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground tabular-nums">
                                            15+
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Medical Specialists
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground tabular-nums">
                                            100%
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Confidential Care
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Interactive Booking Form */}
                            <div className="lg:col-span-6" id="booking">
                                <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary via-indigo-500 to-purple-500" />

                                    {formSubmitted ? (
                                        <div className="flex flex-col items-center text-center py-8 gap-4">
                                            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                                <CheckCircle2Icon className="size-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground">
                                                    Appointment Requested!
                                                </h3>
                                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                                    Thank you,{" "}
                                                    <span className="font-semibold text-foreground">
                                                        {
                                                            bookingData.patientName
                                                        }
                                                    </span>
                                                    . Your consultation request
                                                    for{" "}
                                                    <span className="font-medium text-foreground">
                                                        {bookingData.service}
                                                    </span>{" "}
                                                    has been received.
                                                </p>
                                            </div>

                                            <div className="w-full rounded-xl bg-muted/50 p-4 border text-left text-xs space-y-2 mt-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Confirmation Reference:
                                                    </span>
                                                    <span className="font-mono font-bold text-foreground">
                                                        MED-
                                                        {Math.floor(
                                                            1000 +
                                                                Math.random() *
                                                                    9000,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Specialist:
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        {bookingData.doctor}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Preferred Date & Slot:
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        {bookingData.date} (
                                                        {bookingData.timeSlot})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Contact Phone:
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        {bookingData.phone}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Our patient coordinator will
                                                contact you shortly to confirm
                                                your arrival window and health
                                                questionnaire.
                                            </p>

                                            <div className="w-full pt-2">
                                                <Button
                                                    className="w-full bg-primary text-primary-foreground font-semibold h-10 shadow-xs"
                                                    onClick={() => {
                                                        setFormSubmitted(false);
                                                        setBookingData({
                                                            patientName: "",
                                                            email: "",
                                                            phone: "",
                                                            service:
                                                                "Dental Implants & Cosmetic",
                                                            doctor: "Dr. Eddie Lake",
                                                            date: getLocalDateString(
                                                                0,
                                                            ),
                                                            timeSlot:
                                                                "09:00 AM",
                                                            notes: "",
                                                        });
                                                    }}
                                                >
                                                    <CalendarIcon className="size-4 mr-2" />
                                                    Book Another Appointment
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex flex-col gap-1 border-b pb-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="size-5 text-primary" />
                                                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                        Book Your Appointment
                                                    </h2>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Select your treatment,
                                                    preferred specialist, and
                                                    consultation time.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label
                                                        htmlFor="patientName"
                                                        className="text-xs font-medium"
                                                    >
                                                        Full Name *
                                                    </Label>
                                                    <Input
                                                        id="patientName"
                                                        placeholder="e.g. Sarah Connor"
                                                        required
                                                        value={
                                                            bookingData.patientName
                                                        }
                                                        onChange={(e) =>
                                                            setBookingData({
                                                                ...bookingData,
                                                                patientName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="text-xs h-9"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label
                                                        htmlFor="phone"
                                                        className="text-xs font-medium"
                                                    >
                                                        Phone Number *
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+1 (555) 000-0000"
                                                        required
                                                        value={
                                                            bookingData.phone
                                                        }
                                                        onChange={(e) =>
                                                            setBookingData({
                                                                ...bookingData,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="text-xs h-9"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-xs font-medium"
                                                >
                                                    Email Address (Optional)
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="sarah@example.com"
                                                    value={bookingData.email}
                                                    onChange={(e) =>
                                                        setBookingData({
                                                            ...bookingData,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="text-xs h-9"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-medium">
                                                        Medical Department /
                                                        Service *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            bookingData.service
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            if (val) {
                                                                const s =
                                                                    SERVICES.find(
                                                                        (
                                                                            item,
                                                                        ) =>
                                                                            item.title ===
                                                                            val,
                                                                    );
                                                                setBookingData({
                                                                    ...bookingData,
                                                                    service:
                                                                        val,
                                                                    doctor: s
                                                                        ? s.doctor
                                                                        : bookingData.doctor,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full text-xs h-9">
                                                            <SelectValue placeholder="Select procedure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {SERVICES.map(
                                                                    (s) => (
                                                                        <SelectItem
                                                                            key={
                                                                                s.title
                                                                            }
                                                                            value={
                                                                                s.title
                                                                            }
                                                                        >
                                                                            {
                                                                                s.title
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-medium">
                                                        Specialist / Doctor
                                                    </Label>
                                                    <Select
                                                        value={
                                                            bookingData.doctor
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            if (val)
                                                                setBookingData({
                                                                    ...bookingData,
                                                                    doctor: val,
                                                                });
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full text-xs h-9">
                                                            <SelectValue placeholder="Assigned Doctor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="Dr. Eddie Lake">
                                                                    Dr. Eddie
                                                                    Lake (Dental
                                                                    & Derma)
                                                                </SelectItem>
                                                                <SelectItem value="Dr. Jamik Tashpulatov">
                                                                    Dr. Jamik
                                                                    Tashpulatov
                                                                    (Ortho &
                                                                    Surgery)
                                                                </SelectItem>
                                                                <SelectItem value="Dr. Emily Whalen">
                                                                    Dr. Emily
                                                                    Whalen
                                                                    (Cardio &
                                                                    Joints)
                                                                </SelectItem>
                                                                <SelectItem value="Dr. Sarah Jenkins">
                                                                    Dr. Sarah
                                                                    Jenkins
                                                                    (Pediatrics)
                                                                </SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <Label
                                                            htmlFor="date"
                                                            className="text-xs font-medium"
                                                        >
                                                            Preferred Date *
                                                        </Label>
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {bookingData.date ===
                                                            getLocalDateString(
                                                                0,
                                                            )
                                                                ? "Today"
                                                                : bookingData.date ===
                                                                    getLocalDateString(
                                                                        1,
                                                                    )
                                                                  ? "Tomorrow"
                                                                  : ""}
                                                        </span>
                                                    </div>
                                                    <Input
                                                        id="date"
                                                        type="date"
                                                        required
                                                        min={getLocalDateString(
                                                            0,
                                                        )}
                                                        value={bookingData.date}
                                                        onChange={(e) =>
                                                            setBookingData({
                                                                ...bookingData,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="text-xs h-9"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-medium">
                                                        Time Window Dropdown
                                                    </Label>
                                                    <Select
                                                        value={
                                                            bookingData.timeSlot
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            if (val) {
                                                                const booked =
                                                                    getBookedInfo(
                                                                        val,
                                                                        bookingData.doctor,
                                                                        bookingData.date,
                                                                    );
                                                                if (
                                                                    !booked.isBooked
                                                                ) {
                                                                    setBookingData(
                                                                        {
                                                                            ...bookingData,
                                                                            timeSlot:
                                                                                val,
                                                                        },
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full text-xs h-9">
                                                            <SelectValue placeholder="Select consultation slot" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {ALL_TIME_SLOTS.map(
                                                                    (s) => {
                                                                        const booked =
                                                                            getBookedInfo(
                                                                                s.time,
                                                                                bookingData.doctor,
                                                                                bookingData.date,
                                                                            );
                                                                        return (
                                                                            <SelectItem
                                                                                key={
                                                                                    s.time
                                                                                }
                                                                                value={
                                                                                    s.time
                                                                                }
                                                                                disabled={
                                                                                    booked.isBooked
                                                                                }
                                                                                className={cn(
                                                                                    booked.isBooked &&
                                                                                        "opacity-50 text-muted-foreground cursor-not-allowed line-through",
                                                                                )}
                                                                            >
                                                                                {
                                                                                    s.time
                                                                                }{" "}
                                                                                (
                                                                                {
                                                                                    s.period
                                                                                }

                                                                                )
                                                                                {booked.isBooked
                                                                                    ? " — Confirmed (Unavailable)"
                                                                                    : " — Available"}
                                                                            </SelectItem>
                                                                        );
                                                                    },
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Visual Consultation Slots Picker */}
                                            <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-3.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <ClockIcon className="size-3.5 text-primary" />
                                                        <span className="text-xs font-semibold text-foreground">
                                                            Available Slots for{" "}
                                                            {
                                                                bookingData.doctor.split(
                                                                    " ",
                                                                )[1]
                                                            }
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        <span className="font-semibold text-foreground">
                                                            {
                                                                ALL_TIME_SLOTS.filter(
                                                                    (s) =>
                                                                        !getBookedInfo(
                                                                            s.time,
                                                                            bookingData.doctor,
                                                                            bookingData.date,
                                                                        )
                                                                            .isBooked,
                                                                ).length
                                                            }
                                                        </span>{" "}
                                                        of{" "}
                                                        {ALL_TIME_SLOTS.length}{" "}
                                                        open
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                                                    {ALL_TIME_SLOTS.map(
                                                        (slot) => {
                                                            const booked =
                                                                getBookedInfo(
                                                                    slot.time,
                                                                    bookingData.doctor,
                                                                    bookingData.date,
                                                                );
                                                            const isBooked =
                                                                booked.isBooked;
                                                            const isSelected =
                                                                bookingData.timeSlot ===
                                                                slot.time;

                                                            if (isBooked) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            slot.time
                                                                        }
                                                                        className="relative flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-border/80 bg-muted/40 text-muted-foreground/60 cursor-not-allowed select-none"
                                                                        title={`${slot.time} is already confirmed for ${bookingData.doctor}`}
                                                                    >
                                                                        <span className="text-xs font-medium line-through decoration-muted-foreground/60">
                                                                            {
                                                                                slot.time
                                                                            }
                                                                        </span>
                                                                        <span className="text-[9px] font-semibold tracking-tight text-rose-500/80 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                                                                            <span className="size-1 rounded-full bg-rose-500" />
                                                                            Booked
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={
                                                                        slot.time
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setBookingData(
                                                                            {
                                                                                ...bookingData,
                                                                                timeSlot:
                                                                                    slot.time,
                                                                            },
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "relative flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-2xs hover:scale-[1.02]",
                                                                        isSelected
                                                                            ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                                                                            : "bg-background hover:bg-muted/50 hover:border-primary/40 text-foreground",
                                                                    )}
                                                                >
                                                                    <span className="text-xs font-semibold">
                                                                        {
                                                                            slot.time
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            "text-[9px] tracking-tight font-normal mt-0.5 flex items-center gap-1",
                                                                            isSelected
                                                                                ? "text-primary-foreground/90 font-medium"
                                                                                : "text-emerald-600 dark:text-emerald-400",
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={cn(
                                                                                "size-1 rounded-full",
                                                                                isSelected
                                                                                    ? "bg-white"
                                                                                    : "bg-emerald-500",
                                                                            )}
                                                                        />
                                                                        Available
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        Available for booking
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="size-1.5 rounded-full bg-rose-500" />
                                                        Confirmed with Doctor
                                                        (Blocked)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label
                                                    htmlFor="notes"
                                                    className="text-xs font-medium"
                                                >
                                                    Reason for Visit / Symptoms
                                                    (Optional)
                                                </Label>
                                                <Input
                                                    id="notes"
                                                    placeholder="Brief description of symptoms, routine checkup, or inquiry..."
                                                    value={bookingData.notes}
                                                    onChange={(e) =>
                                                        setBookingData({
                                                            ...bookingData,
                                                            notes: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="text-xs h-9"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-primary text-primary-foreground font-semibold mt-2 h-11"
                                            >
                                                Confirm Appointment Booking
                                            </Button>

                                            <p className="text-[11px] text-center text-muted-foreground">
                                                No upfront payment required.
                                                100% confidential. You can
                                                cancel or reschedule at any
                                                time.
                                            </p>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Clinical Services Section */}
                <section
                    id="services"
                    className="py-16 md:py-24 border-b bg-muted/20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <Badge variant="outline" className="mb-2 text-xs">
                                Specialities
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Comprehensive Healthcare Services
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                From routine preventive checkups to complex
                                specialized surgeries, our clinical departments
                                provide exceptional patient care.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SERVICES.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <Card
                                        key={service.title}
                                        className="hover:shadow-md transition-shadow group/service bg-card"
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="size-5" />
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {service.badge}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base font-semibold group-hover/service:text-primary transition-colors">
                                                {service.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                                {service.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <div className="px-4 pb-4 pt-0 text-xs flex items-center justify-between border-t mt-3 pt-3">
                                            <span className="text-muted-foreground">
                                                Lead:{" "}
                                                <span className="font-medium text-foreground">
                                                    {service.doctor}
                                                </span>
                                            </span>
                                            <a
                                                href="#booking"
                                                className="text-primary font-medium hover:underline flex items-center gap-1"
                                                onClick={() => {
                                                    setBookingData((prev) => ({
                                                        ...prev,
                                                        service: service.title,
                                                        doctor: service.doctor,
                                                    }));
                                                }}
                                            >
                                                Book
                                                <ArrowRightIcon className="size-3" />
                                            </a>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Specialists Section */}
                <section id="specialists" className="py-16 md:py-24 border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <Badge variant="outline" className="mb-2 text-xs">
                                Our Team
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Meet Our Medical Directors
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Renowned physicians and board-certified
                                practitioners with decades of combined clinical
                                excellence.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    name: "Dr. Eddie Lake",
                                    role: "Head of Dentistry & Aesthetics",
                                    experience: "14+ Years Experience",
                                    initials: "EL",
                                },
                                {
                                    name: "Dr. Jamik Tashpulatov",
                                    role: "Senior Orthopedic Surgeon",
                                    experience: "18+ Years Experience",
                                    initials: "JT",
                                },
                                {
                                    name: "Dr. Emily Whalen",
                                    role: "Director of Cardiovascular Health",
                                    experience: "16+ Years Experience",
                                    initials: "EW",
                                },
                                {
                                    name: "Dr. Sarah Jenkins",
                                    role: "Pediatric & Family Medicine",
                                    experience: "12+ Years Experience",
                                    initials: "SJ",
                                },
                            ].map((doc) => (
                                <div
                                    key={doc.name}
                                    className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-xs"
                                >
                                    <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-4">
                                        {doc.initials}
                                    </div>
                                    <h3 className="font-semibold text-base text-foreground">
                                        {doc.name}
                                    </h3>
                                    <p className="text-xs text-primary font-medium mt-1">
                                        {doc.role}
                                    </p>
                                    <span className="text-[11px] text-muted-foreground mt-2">
                                        {doc.experience}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 text-xs w-full"
                                        render={<a href="#booking" />}
                                        onClick={() => {
                                            setBookingData((prev) => ({
                                                ...prev,
                                                doctor: doc.name,
                                            }));
                                        }}
                                    >
                                        Book with {doc.name.split(" ")[1]}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact & Hours Section */}
                <section id="contact" className="py-16 bg-muted/30 border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <PhoneIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground">
                                        Phone & Emergency
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Direct Clinic Line:
                                    </p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">
                                        +1 (555) 234-5678
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Emergency 24/7 On-Call
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <ClockIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground">
                                        Clinic Hours
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Mon – Fri: 8:00 AM – 7:00 PM
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Saturday: 9:00 AM – 4:00 PM
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sunday: Urgent Care Only
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <MapPinIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground">
                                        Location
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Medi Pro Medical Tower
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Suite 400, 750 Health Science Blvd
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Valet & Patient Parking Available
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 bg-background text-xs text-muted-foreground">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <StethoscopeIcon className="size-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                Medi Pro Clinic
                            </span>
                            <span>
                                • All rights reserved &copy;{" "}
                                {new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="#services"
                                className="hover:text-foreground"
                            >
                                Services
                            </a>
                            <span>•</span>
                            <a
                                href="#specialists"
                                className="hover:text-foreground"
                            >
                                Doctors
                            </a>
                            <span>•</span>
                            <a
                                href="#booking"
                                className="hover:text-foreground"
                            >
                                Book Online
                            </a>
                            <span>•</span>
                            <Link
                                href={auth?.user ? "/dashboard" : "/login"}
                                prefetch
                                className="hover:text-foreground transition-colors"
                            >
                                Staff Portal
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
