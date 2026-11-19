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
    AwardIcon,
    CpuIcon,
    CheckIcon,
    ChevronRightIcon,
    SmileIcon,
    MicroscopeIcon,
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
import { BrandLogo, SmartTechIcon } from "@/components/brand-logo";
import type { Appointment } from "@/types/appointment";
import type { DoctorProfile } from "@/types/auth";

const DEFAULT_DOCTORS: DoctorProfile[] = [
    {
        id: 1,
        name: "Dr. Eddie Lake",
        specialty: "Dental Implants & Cosmetic",
        consultation_fee: 1500,
        room: "Room 101",
        email: "eddie.lake@smarttechclinic.com",
        is_active: true,
    },
    {
        id: 2,
        name: "Dr. Jamik Tashpulatov",
        specialty: "Orthodontics & Clear Aligners",
        consultation_fee: 2000,
        room: "Room 102",
        email: "jamik.tashpulatov@smarttechclinic.com",
        is_active: true,
    },
    {
        id: 3,
        name: "Dr. Emily Whalen",
        specialty: "Cardiology Checkup & ECG",
        consultation_fee: 1800,
        room: "Room 201",
        email: "emily.whalen@smarttechclinic.com",
        is_active: true,
    },
    {
        id: 4,
        name: "Dr. Sarah Jenkins",
        specialty: "General & Preventative Care",
        consultation_fee: 1200,
        room: "Room 103",
        email: "sarah.jenkins@smarttechclinic.com",
        is_active: true,
    },
];

function getDoctorInitials(name: string): string {
    const clean = name.replace(/^Dr\.?\s+/i, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
}

const ALL_TIME_SLOTS = [
    { time: "09:00 AM", period: "Morning" },
    { time: "09:30 AM", period: "Morning" },
    { time: "10:00 AM", period: "Morning" },
    { time: "11:00 AM", period: "Late Morning" },
    { time: "11:30 AM", period: "Late Morning" },
    { time: "01:30 PM", period: "Afternoon" },
    { time: "02:00 PM", period: "Afternoon" },
    { time: "02:15 PM", period: "Afternoon" },
    { time: "03:00 PM", period: "Afternoon" },
    { time: "03:45 PM", period: "Late Afternoon" },
    { time: "04:00 PM", period: "Late Afternoon" },
    { time: "04:15 PM", period: "Late Afternoon" },
    { time: "05:30 PM", period: "Evening" },
];

const SERVICES = [
    {
        title: "Cardiology & ECG",
        description:
            "Advanced cardiac telemetry, echo scans, and preventive hypertension management.",
        doctor: "Dr. Emily Whalen",
        icon: HeartPulseIcon,
        badge: "Specialist Lab",
        tag: "Heart & Vascular",
    },
    {
        title: "Orthodontics & Aligners",
        description:
            "AI-guided smile correction, Invisalign clear aligners, and dental reconstruction.",
        doctor: "Dr. Jamik Tashpulatov",
        icon: SmileIcon,
        badge: "Digital Scans",
        tag: "Dental Care",
    },
    {
        title: "Dental Implants & Surgery",
        description:
            "Precision 3D dental mapping, tooth restoration, painless laser whitening.",
        doctor: "Dr. Eddie Lake",
        icon: ActivityIcon,
        badge: "Cosmetic Care",
        tag: "Oral Surgery",
    },
    {
        title: "General & Family Medicine",
        description:
            "Comprehensive annual physicals, blood biomarker screenings, and preventative care.",
        doctor: "Dr. Sarah Jenkins",
        icon: StethoscopeIcon,
        badge: "Zero-Wait",
        tag: "Primary Care",
    },
    {
        title: "Neurology & Diagnostics",
        description:
            "State-of-the-art neurological mapping, migraine treatments, and cognitive evaluations.",
        doctor: "Dr. Emily Whalen",
        icon: CpuIcon,
        badge: "Next-Gen Tech",
        tag: "Diagnostics",
    },
    {
        title: "Pediatrics & Child Wellness",
        description:
            "Gentle child-friendly checkups, growth tracking, and rapid symptom care.",
        doctor: "Dr. Sarah Jenkins",
        icon: ShieldCheckIcon,
        badge: "Family Focused",
        tag: "Child Health",
    },
];

const CLINIC_FACILITIES = [
    {
        title: "State-of-the-Art Diagnostic Suite",
        category: "Advanced Imaging & Diagnostics",
        image: "/images/clinic/diagnostic-suite.jpg",
        description:
            "Equipped with high-precision digital labs, ECG telemetry, and AI-accelerated imaging for accurate, same-day test results.",
    },
    {
        title: "Private Consultation Suites",
        category: "Patient Comfort & Care",
        image: "/images/clinic/patient-care.jpg",
        description:
            "Soundproofed, ergonomic consultation rooms where doctors spend dedicated time without rushed appointments.",
    },
    {
        title: "Specialized Dental Operatory",
        category: "Surgical & Cosmetic Suite",
        image: "/images/clinic/dental-care.jpg",
        description:
            "Featuring 3D intraoral optical scanning, painless dental procedures, and medical-grade sterilization.",
    },
    {
        title: "Concierge Welcome & Recovery Lounge",
        category: "Zero Waiting Facility",
        image: "/images/clinic/modern-facility.jpg",
        description:
            "Boutique clinic atmosphere designed for relaxation, complimentary refreshments, and zero waiting room delays.",
    },
];

const TESTIMONIALS = [
    {
        name: "David Sterling",
        service: "Cardiology Consultation",
        rating: 5,
        text: "Booking through the Smart Tech portal took under 60 seconds and synced straight to my Google Calendar. Dr. Emily was extraordinarily thorough with my ECG report. Best clinical experience in the city.",
        date: "2 days ago",
    },
    {
        name: "Elena Rostova",
        service: "Orthodontics & Aligners",
        rating: 5,
        text: "The digital 3D scans and lack of waiting time blew me away. I arrived, was greeted immediately, and Dr. Jamik walked me through my clear aligner plan step-by-step.",
        date: "Last week",
    },
    {
        name: "Marcus Vance",
        service: "General Checkup",
        rating: 5,
        text: "Finally a medical clinic that respects your time! Modern, immaculate facilities and zero delays. The automatic appointment reminder and calendar invites were flawless.",
        date: "2 weeks ago",
    },
];

function getLocalDateString(offsetDays = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateLabel(dateStr: string): string {
    if (!dateStr) return "";
    const today = getLocalDateString(0);
    const tomorrow = getLocalDateString(1);
    if (dateStr === today) return "Today";
    if (dateStr === tomorrow) return "Tomorrow";
    try {
        const [y, m, d] = dateStr.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function parseSlotTime(timeStr: string, dateStr: string): Date | null {
    if (!timeStr || !dateStr) return null;
    try {
        const parts = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!parts) return null;
        let hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const modifier = parts[3].toUpperCase();
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d, hours, minutes, 0, 0);
    } catch {
        return null;
    }
}

function isSlotPast(timeStr: string, dateStr: string): boolean {
    const today = getLocalDateString(0);
    if (dateStr !== today) return false;
    const slotDate = parseSlotTime(timeStr, dateStr);
    if (!slotDate) return false;
    return slotDate.getTime() < Date.now();
}

interface BookedSlot {
    id: number;
    doctor: string;
    date: string;
    time: string;
    status: string;
}

interface WelcomeProps {
    doctors?: DoctorProfile[];
    bookedSlots?: BookedSlot[];
}

export default function Welcome({
    doctors = [],
    bookedSlots = [],
}: WelcomeProps) {
    const { auth } = usePage().props as unknown as {
        auth?: { user?: any };
    };

    const clinicDoctors = React.useMemo(() => {
        if (doctors && doctors.length > 0) {
            return doctors;
        }
        return DEFAULT_DOCTORS;
    }, [doctors]);

    const doctorList = clinicDoctors;
    const defaultDoctor = doctorList[0]?.name || "Dr. Eddie Lake";
    const defaultService =
        doctorList[0]?.specialty || "Dental Implants & Cosmetic";

    const [bookingData, setBookingData] = React.useState({
        patientName: "",
        phone: "",
        email: "",
        service: defaultService,
        doctor: defaultDoctor,
        date: getLocalDateString(0),
        timeSlot: "09:00 AM",
        notes: "",
    });

    const [formSubmitted, setFormSubmitted] = React.useState(false);
    const [isScrolledPastHero, setIsScrolledPastHero] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const heroEl = document.getElementById("hero-section");
            if (heroEl) {
                const rect = heroEl.getBoundingClientRect();
                setIsScrolledPastHero(rect.bottom <= 80);
            } else {
                setIsScrolledPastHero(window.scrollY > 450);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Filter appointments from backend bookedSlots prop
    const getBookedInfo = React.useCallback(
        (timeStr: string, doctorName: string, dateStr: string) => {
            const match = bookedSlots.find((b) => {
                const sameDoc =
                    b.doctor.trim().toLowerCase() ===
                    doctorName.trim().toLowerCase();
                const bDate =
                    b.date === "Today"
                        ? getLocalDateString(0)
                        : b.date === "Tomorrow"
                          ? getLocalDateString(1)
                          : b.date;
                const reqDate =
                    dateStr === "Today"
                        ? getLocalDateString(0)
                        : dateStr === "Tomorrow"
                          ? getLocalDateString(1)
                          : dateStr;
                const sameDate = bDate === reqDate;
                const sameTime =
                    b.time.trim().toLowerCase() ===
                    timeStr.trim().toLowerCase();
                return sameDoc && sameDate && sameTime;
            });

            return {
                isBooked: !!match,
                status: match?.status || null,
            };
        },
        [bookedSlots],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !bookingData.patientName ||
            !bookingData.phone ||
            !bookingData.email ||
            !bookingData.date
        ) {
            alert(
                "Please fill in your name, phone number, email address, and preferred date.",
            );
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingData.email.trim())) {
            alert(
                "Please enter a valid email address for your calendar confirmation.",
            );
            return;
        }

        if (!bookingData.timeSlot) {
            alert("Please select an available consultation slot.");
            return;
        }

        if (isSlotPast(bookingData.timeSlot, bookingData.date)) {
            alert(
                `The consultation slot ${bookingData.timeSlot} has already passed for today. Please pick an upcoming slot.`,
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
                `The time slot ${bookingData.timeSlot} is already booked for ${bookingData.doctor} on this date. Please select an alternate slot.`,
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
            patientEmail: bookingData.email.trim(),
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
                "Booked online via Smart Tech Medical client portal.",
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
            const existingList: Appointment[] = stored
                ? JSON.parse(stored)
                : [];
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
            <Head title="Smart Tech Medical Clinic | Next-Gen Healthcare & Online Appointments" />

            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
                {/* Fixed Navigation Bar: Transparent in Hero, Blurred in Other Sections */}
                <header
                    className={cn(
                        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out",
                        isScrolledPastHero
                            ? "bg-background/85 backdrop-blur-xl border-b border-border/70 shadow-xs text-foreground"
                            : "bg-transparent border-b border-transparent text-white shadow-none",
                    )}
                >
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="transition-transform hover:scale-[1.02]"
                        >
                            <BrandLogo
                                size="md"
                                variant={isScrolledPastHero ? "auto" : "light"}
                            />
                        </Link>

                        <nav
                            className={cn(
                                "hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide uppercase transition-colors",
                                isScrolledPastHero
                                    ? "text-muted-foreground"
                                    : "text-white/80",
                            )}
                        >
                            {/* <a
                                href="#booking"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Book Appointment
                            </a>
                            <a
                                href="#facilities"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Clinic Facilities
                            </a>
                            <a
                                href="#services"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Medical Services
                            </a>
                            <a
                                href="#specialists"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Specialists
                            </a>
                            <a
                                href="#reviews"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Reviews
                            </a>
                            <a
                                href="#contact"
                                className={cn(
                                    "transition-colors",
                                    isScrolledPastHero
                                        ? "hover:text-cyan-500"
                                        : "hover:text-white",
                                )}
                            >
                                Location & Hours
                            </a> */}
                        </nav>

                        <div className="flex items-center gap-3">
                            {/* <Link
                                href={auth?.user ? "/dashboard" : "/login"}
                                prefetch
                                className={cn(
                                    "hidden sm:inline-flex text-xs font-medium transition-colors px-2 py-1",
                                    isScrolledPastHero
                                        ? "text-muted-foreground hover:text-foreground"
                                        : "text-white/80 hover:text-white",
                                )}
                            >
                                Staff Portal
                            </Link> */}
                            <Button
                                size="sm"
                                render={<a href="#booking" />}
                                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 border-0 h-9 px-4 rounded-lg cursor-pointer transition-transform hover:scale-105"
                            >
                                <CalendarIcon className="size-3.5 mr-1.5" />
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Hero Section: Clinic Imagery + Interactive Booking Engine */}
                <section
                    id="hero-section"
                    className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-slate-950 via-slate-900 to-background text-foreground pt-28 sm:pt-32 md:pt-36 pb-16 md:pb-24"
                >
                    {/* Background Glows matching Smart Tech Logo Colors */}
                    <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-cyan-500/15 blur-3xl" />
                    <div className="pointer-events-none absolute top-10 right-0 size-[450px] rounded-full bg-purple-600/15 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-1/3 size-[400px] rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
                            {/* Left Column: Clinic Presentation & Hero Imagery */}
                            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
                                <div className="inline-flex items-center">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium font-sans text-cyan-400 shadow-inner backdrop-blur-md">
                                        <SparklesIcon className="size-3.5 text-cyan-400" />
                                        <span>
                                            Next-Gen Smart Tech Healthcare
                                        </span>
                                        <span className="text-slate-400">
                                            •
                                        </span>
                                        <span className="text-white">
                                            Same-Day Slots
                                        </span>
                                    </div>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-sans tracking-tight text-white leading-[1.12]">
                                    World-Class Clinical Care,{" "}
                                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Personalized For You.
                                    </span>
                                </h1>

                                <p className="text-sm sm:text-base font-normal text-slate-300 leading-relaxed max-w-xl">
                                    Experience healthcare engineered for the
                                    modern patient. Board-certified physicians,
                                    AI-assisted diagnostics, 1-click Google &
                                    Apple calendar integration, and a strict
                                    zero-waiting-time commitment.
                                </p>

                                {/* Trust Metrics Bar */}
                                {/* <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-800/80 max-w-lg">
                                    <div>
                                        <div className="text-2xl font-black text-white tabular-nums">
                                            4.9/5
                                        </div>
                                        <div className="text-[11px] text-cyan-300/90 flex items-center gap-1 mt-0.5 font-medium">
                                            <StarIcon className="size-3 fill-cyan-400 text-cyan-400" />
                                            2,400+ Reviews
                                        </div>
                                    </div>
                                    <div className="border-l border-slate-800/80 pl-3">
                                        <div className="text-2xl font-black text-white tabular-nums">
                                            15+
                                        </div>
                                        <div className="text-[11px] text-slate-300 mt-0.5 font-medium">
                                            Top Specialists
                                        </div>
                                    </div>
                                    <div className="border-l border-slate-800/80 pl-3">
                                        <div className="text-2xl font-black text-white tabular-nums">
                                            0 Mins
                                        </div>
                                        <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
                                            Wait Guarantee
                                        </div>
                                    </div>
                                </div> */}

                                {/* HERO CLINIC IMAGERY SHOWCASE */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Building2Icon className="size-3.5 text-cyan-400" />
                                            Inside Our Clinic Facility
                                        </span>
                                        <span className="text-[11px] text-cyan-400 font-medium">
                                            Suite 400 • Medical Tower
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {/* Image 1: Main Doctor Consultation */}
                                        <div className="group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md col-span-2 sm:col-span-2 aspect-16/9">
                                            <img
                                                src="/images/clinic/doctor-consultation.jpg"
                                                alt="Doctor consultation at Smart Tech Clinic"
                                                className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">
                                                        Specialist Consultations
                                                    </p>
                                                    <p className="text-[10px] text-slate-300">
                                                        Direct 1-on-1
                                                        personalized time
                                                    </p>
                                                </div>
                                                <Badge className="bg-cyan-500/90 text-white text-[9px] border-0">
                                                    Board Certified
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Image 2: Modern Clinic Facility */}
                                        <div className="group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md aspect-16/9 sm:aspect-auto">
                                            <img
                                                src="/images/clinic/modern-facility.jpg"
                                                alt="Smart Tech Clinic modern reception"
                                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-[11px] font-bold text-white leading-tight">
                                                    Executive Lounge
                                                </p>
                                                <p className="text-[9px] text-slate-300">
                                                    Zero waiting area
                                                </p>
                                            </div>
                                        </div>

                                        {/* Image 3: Examination & Patient Care */}
                                        <div className="group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md aspect-16/9 sm:aspect-auto">
                                            <img
                                                src="/images/clinic/patient-care.jpg"
                                                alt="Patient care examination suite"
                                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-[11px] font-bold text-white leading-tight">
                                                    Care Suites
                                                </p>
                                                <p className="text-[9px] text-slate-300">
                                                    Private & sanitized
                                                </p>
                                            </div>
                                        </div>

                                        {/* Image 4: Diagnostic Suite */}
                                        <div className="group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md col-span-2 sm:col-span-2 aspect-16/9">
                                            <img
                                                src="/images/clinic/diagnostic-suite.jpg"
                                                alt="Smart Tech diagnostic lab"
                                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">
                                                        Diagnostic & Imaging Lab
                                                    </p>
                                                    <p className="text-[10px] text-slate-300">
                                                        Same-day digital results
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                                                    <CpuIcon className="size-3" />{" "}
                                                    AI Assisted
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: High-Converting Interactive Appointment Booking Form */}
                            <div className="lg:col-span-6 w-full" id="booking">
                                <div className="rounded-2xl border border-cyan-500/30 bg-card p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                    {/* Luminous Logo Accent Top Bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />

                                    {formSubmitted ? (
                                        <div className="flex flex-col items-center text-center py-8 gap-4">
                                            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 animate-in zoom-in-75 duration-300">
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
                                                    has been received by the
                                                    Smart Tech clinical staff.
                                                </p>
                                            </div>

                                            <div className="w-full rounded-xl bg-muted/50 p-4 border text-left text-xs space-y-2 mt-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Reference Code:
                                                    </span>
                                                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                                                        STC-
                                                        {Math.floor(
                                                            1000 +
                                                                Math.random() *
                                                                    9000,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Assigned Specialist:
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {bookingData.doctor}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Date & Time:
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {bookingData.date} at{" "}
                                                        {bookingData.timeSlot}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Confirmation Email:
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {bookingData.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 text-left text-xs text-cyan-700 dark:text-cyan-300 w-full flex items-start gap-2.5">
                                                <CalendarIcon className="size-4 shrink-0 mt-0.5 text-cyan-500" />
                                                <span>
                                                    <strong>
                                                        Automated Calendar Sync:
                                                    </strong>{" "}
                                                    Once verified by clinic
                                                    reception on our dashboard,
                                                    an email with 1-click Google
                                                    Calendar & Apple Calendar
                                                    (.ics) invites will be sent
                                                    directly to{" "}
                                                    <strong>
                                                        {bookingData.email}
                                                    </strong>
                                                    .
                                                </span>
                                            </div>

                                            <div className="w-full pt-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setFormSubmitted(false);
                                                        setBookingData(
                                                            (prev) => ({
                                                                ...prev,
                                                                patientName: "",
                                                                phone: "",
                                                                email: "",
                                                                notes: "",
                                                            }),
                                                        );
                                                    }}
                                                    className="w-full text-xs"
                                                >
                                                    Book Another Consultation
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="size-5 text-cyan-500" />
                                                        <h2 className="text-lg font-bold text-foreground">
                                                            Book Your
                                                            Appointment
                                                        </h2>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Select your treatment,
                                                        preferred specialist,
                                                        and consultation slot.
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                                                    <ClockIcon className="size-3" />{" "}
                                                    Real-Time
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label
                                                        htmlFor="patientName"
                                                        className="text-xs font-semibold"
                                                    >
                                                        Full Name *
                                                    </Label>
                                                    <Input
                                                        id="patientName"
                                                        required
                                                        placeholder="e.g. Sarah Connor"
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
                                                        className="text-xs h-9 focus-visible:ring-cyan-500"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label
                                                        htmlFor="phone"
                                                        className="text-xs font-semibold"
                                                    >
                                                        Phone Number *
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        required
                                                        placeholder="+91 1234567890"
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
                                                        className="text-xs h-9 focus-visible:ring-cyan-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-xs font-semibold flex items-center justify-between"
                                                >
                                                    <span>Email Address *</span>
                                                    <span className="text-[10px] font-normal text-cyan-600 dark:text-cyan-400">
                                                        For Google & Apple
                                                        calendar invite
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="sarah@example.com"
                                                    value={bookingData.email}
                                                    onChange={(e) =>
                                                        setBookingData({
                                                            ...bookingData,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="text-xs h-9 focus-visible:ring-cyan-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-semibold">
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
                                                                const matchingDoctor =
                                                                    doctorList.find(
                                                                        (d) =>
                                                                            d.specialty ===
                                                                            val,
                                                                    );
                                                                setBookingData({
                                                                    ...bookingData,
                                                                    service:
                                                                        val,
                                                                    doctor: matchingDoctor
                                                                        ? matchingDoctor.name
                                                                        : bookingData.doctor,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full text-xs h-9">
                                                            <SelectValue placeholder="Select clinical department" />
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
                                                                {doctorList.map(
                                                                    (d) => {
                                                                        if (
                                                                            !d.specialty ||
                                                                            SERVICES.some(
                                                                                (
                                                                                    s,
                                                                                ) =>
                                                                                    s.title ===
                                                                                    d.specialty,
                                                                            )
                                                                        )
                                                                            return null;
                                                                        return (
                                                                            <SelectItem
                                                                                key={
                                                                                    d.specialty
                                                                                }
                                                                                value={
                                                                                    d.specialty
                                                                                }
                                                                            >
                                                                                {
                                                                                    d.specialty
                                                                                }
                                                                            </SelectItem>
                                                                        );
                                                                    },
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-semibold">
                                                        Specialist / Doctor *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            bookingData.doctor
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            if (val) {
                                                                const chosenDoctor =
                                                                    doctorList.find(
                                                                        (d) =>
                                                                            d.name ===
                                                                            val,
                                                                    );
                                                                setBookingData({
                                                                    ...bookingData,
                                                                    doctor: val,
                                                                    service:
                                                                        chosenDoctor?.specialty ||
                                                                        bookingData.service,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full text-xs h-9">
                                                            <SelectValue placeholder="Select specialist" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {doctorList.map(
                                                                    (doc) => (
                                                                        <SelectItem
                                                                            key={
                                                                                doc.name
                                                                            }
                                                                            value={
                                                                                doc.name
                                                                            }
                                                                        >
                                                                            {
                                                                                doc.name
                                                                            }{" "}
                                                                            (
                                                                            {doc.specialty ||
                                                                                "Specialist"}
                                                                            )
                                                                        </SelectItem>
                                                                    ),
                                                                )}
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
                                                            className="text-xs font-semibold"
                                                        >
                                                            Preferred Date *
                                                        </Label>
                                                        <div className="flex items-center gap-1.5 text-[10px]">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setBookingData(
                                                                        {
                                                                            ...bookingData,
                                                                            date: getLocalDateString(
                                                                                0,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                                                                    bookingData.date ===
                                                                        getLocalDateString(
                                                                            0,
                                                                        )
                                                                        ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold"
                                                                        : "text-muted-foreground hover:text-foreground",
                                                                )}
                                                            >
                                                                Today
                                                            </button>
                                                            <span>•</span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setBookingData(
                                                                        {
                                                                            ...bookingData,
                                                                            date: getLocalDateString(
                                                                                1,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                                                                    bookingData.date ===
                                                                        getLocalDateString(
                                                                            1,
                                                                        )
                                                                        ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold"
                                                                        : "text-muted-foreground hover:text-foreground",
                                                                )}
                                                            >
                                                                Tomorrow
                                                            </button>
                                                        </div>
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
                                                        className="text-xs h-9 focus-visible:ring-cyan-500"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-semibold">
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
                                                                        const isPast =
                                                                            isSlotPast(
                                                                                s.time,
                                                                                bookingData.date,
                                                                            );
                                                                        const isUnavailable =
                                                                            booked.isBooked ||
                                                                            isPast;
                                                                        return (
                                                                            <SelectItem
                                                                                key={
                                                                                    s.time
                                                                                }
                                                                                value={
                                                                                    s.time
                                                                                }
                                                                                disabled={
                                                                                    isUnavailable
                                                                                }
                                                                                className={cn(
                                                                                    isUnavailable &&
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
                                                                                {isPast
                                                                                    ? " — Passed"
                                                                                    : booked.isBooked
                                                                                      ? " — Confirmed"
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
                                            <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <ClockIcon className="size-3.5 text-cyan-500" />
                                                        <span className="text-xs font-bold text-foreground">
                                                            Available Slots for{" "}
                                                            {bookingData.doctor.replace(
                                                                /^Dr\.?\s+/i,
                                                                "",
                                                            ) ||
                                                                bookingData.doctor}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                                            {
                                                                ALL_TIME_SLOTS.filter(
                                                                    (s) =>
                                                                        !isSlotPast(
                                                                            s.time,
                                                                            bookingData.date,
                                                                        ) &&
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
                                                            const isPast =
                                                                isSlotPast(
                                                                    slot.time,
                                                                    bookingData.date,
                                                                );
                                                            const isBooked =
                                                                booked.isBooked;
                                                            const isSelected =
                                                                bookingData.timeSlot ===
                                                                slot.time;

                                                            if (isPast) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            slot.time
                                                                        }
                                                                        className="relative flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground/40 cursor-not-allowed select-none"
                                                                        title={`${slot.time} has already passed for today`}
                                                                    >
                                                                        <span className="text-xs font-medium line-through">
                                                                            {
                                                                                slot.time
                                                                            }
                                                                        </span>
                                                                        <span className="text-[9px] font-semibold text-muted-foreground/60 mt-0.5">
                                                                            Passed
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }

                                                            if (isBooked) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            slot.time
                                                                        }
                                                                        className="relative flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-border/80 bg-muted/40 text-muted-foreground/60 cursor-not-allowed select-none"
                                                                        title={`${slot.time} is already booked`}
                                                                    >
                                                                        <span className="text-xs font-medium line-through">
                                                                            {
                                                                                slot.time
                                                                            }
                                                                        </span>
                                                                        <span className="text-[9px] font-semibold text-rose-500 mt-0.5 flex items-center gap-1">
                                                                            <span className="size-1 rounded-full bg-rose-500" />{" "}
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
                                                                            ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/40"
                                                                            : "bg-background hover:bg-muted/50 hover:border-cyan-500/40 text-foreground",
                                                                    )}
                                                                >
                                                                    <span className="text-xs font-bold">
                                                                        {
                                                                            slot.time
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            "text-[9px] tracking-tight mt-0.5 flex items-center gap-1",
                                                                            isSelected
                                                                                ? "text-white font-medium"
                                                                                : "text-cyan-600 dark:text-cyan-400 font-medium",
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={cn(
                                                                                "size-1 rounded-full",
                                                                                isSelected
                                                                                    ? "bg-white"
                                                                                    : "bg-cyan-500",
                                                                            )}
                                                                        />
                                                                        Available
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 gap-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="size-1.5 rounded-full bg-cyan-500" />
                                                        Available for booking
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="size-1.5 rounded-full bg-rose-500" />
                                                        Confirmed with Doctor
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                                                        Time Passed
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label
                                                    htmlFor="notes"
                                                    className="text-xs font-semibold"
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
                                                    className="text-xs h-9 focus-visible:ring-cyan-500"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-bold h-12 shadow-lg shadow-cyan-500/25 border-0 text-sm mt-1 cursor-pointer transition-all hover:scale-[1.005]"
                                            >
                                                <CalendarIcon className="size-4 mr-2" />
                                                Confirm Appointment Booking
                                            </Button>

                                            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground pt-1">
                                                <span className="flex items-center gap-1">
                                                    <ShieldCheckIcon className="size-3 text-cyan-500" />{" "}
                                                    100% Confidential
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    No prepayment needed
                                                </span>
                                                <span>•</span>
                                                <span>Free rescheduling</span>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & Quality Accreditations Bar */}
                <section className="border-b bg-muted/40 py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <AwardIcon className="size-6 text-cyan-500" />
                                <span className="font-bold text-sm text-foreground">
                                    JCI Accredited Facility
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    International gold standard in healthcare
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <ShieldCheckIcon className="size-6 text-blue-500" />
                                <span className="font-bold text-sm text-foreground">
                                    HIPAA & GDPR Compliant
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Military-grade health record encryption
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <ClockIcon className="size-6 text-purple-500" />
                                <span className="font-bold text-sm text-foreground">
                                    Zero-Waiting Guarantee
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Average wait time under 4 minutes
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <StarIcon className="size-6 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-sm text-foreground">
                                    4.9 Star Patient Score
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Over 2,400 verified patient reviews
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CLINIC FACILITIES & TECH GALLERY SHOWCASE */}
                <section
                    id="facilities"
                    className="py-16 md:py-24 border-b bg-background"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <Badge
                                variant="outline"
                                className="mb-2 text-xs border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                            >
                                Clinical Excellence
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                State-of-the-Art Medical Facilities
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Our clinic is built from the ground up for
                                diagnostic accuracy, safety, and tranquil
                                patient recovery.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {CLINIC_FACILITIES.map((facility) => (
                                <div
                                    key={facility.title}
                                    className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all flex flex-col"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                                        <img
                                            src={facility.image}
                                            alt={facility.title}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                                                {facility.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="font-bold text-base text-foreground group-hover:text-cyan-500 transition-colors">
                                                {facility.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                                {facility.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between text-xs">
                                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                                                Sanitized Medical Suite
                                            </span>
                                            <a
                                                href="#booking"
                                                className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
                                            >
                                                Book Tour{" "}
                                                <ArrowRightIcon className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <Badge
                                variant="outline"
                                className="mb-2 text-xs border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            >
                                Specialties & Care
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Comprehensive Healthcare Services
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                From routine preventive checkups to complex
                                specialized interventions, our departments
                                provide exceptional patient care.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SERVICES.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <Card
                                        key={service.title}
                                        className="hover:shadow-lg transition-all group/service bg-card border-border/80 hover:border-cyan-500/40"
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                                                    <Icon className="size-5" />
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                                >
                                                    {service.badge}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base font-bold group-hover/service:text-cyan-500 transition-colors">
                                                {service.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {service.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <div className="px-6 pb-5 pt-0 text-xs flex items-center justify-between border-t border-border/50 mt-2 pt-3.5">
                                            <span className="text-muted-foreground">
                                                Department Lead:{" "}
                                                <span className="font-semibold text-foreground">
                                                    {service.doctor}
                                                </span>
                                            </span>
                                            <a
                                                href="#booking"
                                                className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
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
                <section
                    id="specialists"
                    className="py-16 md:py-24 border-b bg-background"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <Badge
                                variant="outline"
                                className="mb-2 text-xs border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            >
                                Medical Directors
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Meet Our Board-Certified Specialists
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Renowned physicians and board-certified
                                practitioners with decades of combined clinical
                                excellence.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {doctorList.map((doc, idx) => {
                                const initials = getDoctorInitials(doc.name);
                                const displayName = doc.name;
                                const cleanName = displayName.replace(
                                    /^Dr\.?\s+/i,
                                    "",
                                );
                                const firstName =
                                    cleanName.split(" ")[0] || displayName;

                                return (
                                    <div
                                        key={doc.id || doc.name}
                                        className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/80 bg-card shadow-sm hover:border-cyan-500/40 hover:shadow-lg transition-all"
                                    >
                                        <div className="relative size-20 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-md shadow-cyan-500/20">
                                            {initials}
                                            <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 border-2 border-background" />
                                        </div>
                                        <h3 className="font-bold text-base text-foreground">
                                            {displayName}
                                        </h3>
                                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                                            {doc.specialty ||
                                                "Clinic Specialist"}
                                        </p>
                                        <span className="text-[11px] text-muted-foreground mt-2">
                                            {doc.room
                                                ? `Consulting in ${doc.room}`
                                                : "Board Certified Specialist"}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-5 text-xs w-full cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400"
                                            render={<a href="#booking" />}
                                            onClick={() => {
                                                setBookingData((prev) => ({
                                                    ...prev,
                                                    doctor: doc.name,
                                                    service:
                                                        doc.specialty ||
                                                        prev.service,
                                                }));
                                            }}
                                        >
                                            Book with {firstName}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Patient Testimonials & Social Proof */}
                <section
                    id="reviews"
                    className="py-16 md:py-24 border-b bg-muted/30"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <Badge
                                variant="outline"
                                className="mb-2 text-xs border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            >
                                Patient Stories
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Rated 4.9/5 by Over 2,400 Patients
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Real experiences from patients who trust Smart
                                Tech Medical Clinic for their consultations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map((t) => (
                                <Card
                                    key={t.name}
                                    className="p-6 bg-card border-border/80 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(t.rating)].map(
                                                (_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className="size-4 fill-amber-400 text-amber-400"
                                                    />
                                                ),
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/90 italic leading-relaxed">
                                            &ldquo;{t.text}&rdquo;
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="font-bold text-foreground">
                                                {t.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {t.service}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {t.date}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact & Hours Section */}
                <section id="contact" className="py-16 bg-background border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/80 bg-muted/20">
                                <div className="size-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                                    <PhoneIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">
                                        Phone & Urgent Care
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Direct Reception Desk:
                                    </p>
                                    <p className="text-sm font-bold text-foreground mt-0.5">
                                        +1 (555) 234-5678
                                    </p>
                                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-1">
                                        Emergency 24/7 On-Call
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/80 bg-muted/20">
                                <div className="size-12 rounded-xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <ClockIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">
                                        Clinic Operating Hours
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Mon – Fri: 8:00 AM – 7:00 PM
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Saturday: 9:00 AM – 4:00 PM
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sunday: Urgent Appointments Only
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/80 bg-muted/20">
                                <div className="size-12 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                                    <MapPinIcon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">
                                        Clinic Location
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Smart Tech Medical Tower
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
                <footer className="py-10 bg-slate-950 text-white text-xs border-t border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <BrandLogo size="md" variant="light" />
                            <span className="hidden sm:inline-block text-slate-600">
                                |
                            </span>
                            <span className="text-slate-400 text-[11px]">
                                &copy; {new Date().getFullYear()} Smart Tech
                                Medical Clinic. All rights reserved.
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400 text-xs font-medium">
                            <a
                                href="#booking"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                Book Online
                            </a>
                            <span>•</span>
                            <a
                                href="#facilities"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                Facilities
                            </a>
                            <span>•</span>
                            <a
                                href="#services"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                Services
                            </a>
                            <span>•</span>
                            <a
                                href="#specialists"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                Doctors
                            </a>
                            <span>•</span>
                            <a
                                href="#reviews"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                Reviews
                            </a>
                            <span>•</span>
                            <Link
                                href={auth?.user ? "/dashboard" : "/login"}
                                prefetch
                                className="text-cyan-400 hover:text-white font-semibold transition-colors"
                            >
                                Staff Login
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
