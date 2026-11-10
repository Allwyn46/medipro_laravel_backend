import * as React from "react";
import { Link } from "@inertiajs/react";
import {
    PlusIcon,
    Trash2Icon,
    ArrowLeftIcon,
    StethoscopeIcon,
    MailIcon,
    PhoneIcon,
    IndianRupeeIcon,
    DoorOpenIcon,
    AlertCircleIcon,
    Edit3Icon,
    CheckCircle2Icon,
    LockIcon,
    SlidersHorizontalIcon,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { DoctorProfile } from "@/types/auth";

interface DoctorWithUser extends DoctorProfile {
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface Props {
    doctors: DoctorWithUser[];
}

export default function DoctorSettingsPage({ doctors: initialDoctors }: Props) {
    const [doctors, setDoctors] = React.useState<DoctorWithUser[]>(initialDoctors || []);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editDoctor, setEditDoctor] = React.useState<DoctorWithUser | null>(null);

    // Form states
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [specialty, setSpecialty] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [fee, setFee] = React.useState<number | string>(1500);
    const [room, setRoom] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setSpecialty("");
        setPhone("");
        setFee(1500);
        setRoom("");
        setError(null);
    };

    const handleCreateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password.trim() || !specialty.trim()) {
            setError("Please fill in all required fields (Name, Email, Password, Specialty).");
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const response = await fetch("/api/doctors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: password.trim(),
                    specialty: specialty.trim(),
                    phone: phone.trim() || null,
                    consultation_fee: fee ? Number(fee) : 1500,
                    room: room.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const message =
                    data.message ||
                    (data.errors && Object.values(data.errors).flat().join(" ")) ||
                    "Failed to create doctor.";
                setError(message);
                setIsSubmitting(false);
                return;
            }

            if (data.doctor) {
                setDoctors((prev) => [...prev, data.doctor]);
            }
            toast.success(`Doctor "${name.trim()}" provisioned successfully.`);
            resetForm();
            setIsAddOpen(false);
        } catch (err) {
            console.error("Error creating doctor:", err);
            setError("Network error while creating doctor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editDoctor) return;
        setError(null);

        setIsSubmitting(true);
        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const payload: Record<string, any> = {
                specialty: editDoctor.specialty,
                phone: editDoctor.phone,
                consultation_fee: editDoctor.consultation_fee,
                room: editDoctor.room,
            };

            if (password.trim()) {
                payload.password = password.trim();
            }

            const response = await fetch(`/api/doctors/${editDoctor.id}`, {
                method: "PATCH",
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
                setError(data.message || "Failed to update doctor.");
                setIsSubmitting(false);
                return;
            }

            setDoctors((prev) =>
                prev.map((d) => (d.id === editDoctor.id ? { ...d, ...data.doctor } : d))
            );
            toast.success(`Doctor profile updated.`);
            setEditDoctor(null);
            setPassword("");
        } catch (err) {
            console.error("Error updating doctor:", err);
            setError("Network error updating doctor profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (id: number, docName: string) => {
        if (!confirm(`Are you sure you want to deactivate ${docName}?`)) {
            return;
        }

        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

            const response = await fetch(`/api/doctors/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                setDoctors((prev) =>
                    prev.map((d) => (d.id === id ? { ...d, is_active: false } : d))
                );
                toast.success(`${docName} has been deactivated.`);
            } else {
                toast.error("Failed to deactivate doctor.");
            }
        } catch (err) {
            console.error("Error deactivating doctor:", err);
            toast.error("Network error.");
        }
    };

    return (
        <Layout title="Doctor Management | MediPro Admin">
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                render={
                                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" />
                                }
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <StethoscopeIcon className="size-6 text-primary" />
                            Doctor & Specialist Directory
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Provision clinical doctor logins, assign specialties, and manage isolated physician workspaces.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            render={<Link href="/settings/leads" className="text-xs inline-flex items-center gap-1.5" />}
                        >
                            <SlidersHorizontalIcon className="size-3.5" />
                            Lead Form Settings
                        </Button>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsAddOpen(true);
                            }}
                            className="bg-primary text-primary-foreground font-medium text-xs sm:text-sm"
                        >
                            <PlusIcon className="size-4" />
                            <span>Add New Doctor</span>
                        </Button>
                    </div>
                </div>

                {/* Doctors Directory Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Registered Clinic Specialists
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Physicians configured with scoped access to their assigned appointments and patient leads.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {doctors.filter((d) => d.is_active).length} Active Doctors
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs bg-muted/40">
                                        <TableHead className="w-[220px]">Physician Name</TableHead>
                                        <TableHead className="w-[200px]">Login Email</TableHead>
                                        <TableHead>Clinical Specialty</TableHead>
                                        <TableHead className="w-[120px]">Fee (₹)</TableHead>
                                        <TableHead className="w-[120px]">Suite / Cabin</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctors.map((doc) => (
                                        <TableRow key={doc.id} className="text-xs">
                                            <TableCell className="font-semibold text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                        {doc.name.replace("Dr. ", "").charAt(0)}
                                                    </div>
                                                    <span>{doc.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                {doc.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium"
                                                >
                                                    {doc.specialty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold tabular-nums">
                                                ₹{Number(doc.consultation_fee).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[11px]">
                                                {doc.room || "Suite 1"}
                                            </TableCell>
                                            <TableCell>
                                                {doc.is_active ? (
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
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => {
                                                            setEditDoctor(doc);
                                                            setPassword("");
                                                        }}
                                                        title="Edit doctor profile"
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit3Icon className="size-3.5" />
                                                    </Button>
                                                    {doc.is_active && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleDeactivate(doc.id, doc.name)}
                                                            title="Deactivate doctor"
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2Icon className="size-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Doctor Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-lg p-5 sm:p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <StethoscopeIcon className="size-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-semibold">
                                        Provision Doctor Account
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        Create a physician login with isolated patient schedule and revenue access.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleCreateDoctor} className="flex flex-col gap-4 mt-2">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                                    <AlertCircleIcon className="size-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-name" className="text-xs font-medium">
                                        Physician Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="doc-name"
                                        type="text"
                                        required
                                        placeholder="e.g. Dr. Sarah Jenkins"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-specialty" className="text-xs font-medium">
                                        Clinical Specialty <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="doc-specialty"
                                        type="text"
                                        required
                                        placeholder="e.g. Orthodontics & Clear Aligners"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-email" className="text-xs font-medium">
                                        Login Email <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="doc-email"
                                            type="email"
                                            required
                                            placeholder="doctor@medipro.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-8 text-xs h-8"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-password" className="text-xs font-medium">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <LockIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="doc-password"
                                            type="password"
                                            required
                                            placeholder="Min 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-8 text-xs h-8"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-fee" className="text-xs font-medium">
                                        Consultation Fee (₹)
                                    </Label>
                                    <div className="relative">
                                        <IndianRupeeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="doc-fee"
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={fee}
                                            onChange={(e) => setFee(e.target.value)}
                                            className="pl-8 text-xs h-8"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-phone" className="text-xs font-medium">
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="doc-phone"
                                            type="tel"
                                            placeholder="+91 98765 00000"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="pl-8 text-xs h-8"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="doc-room" className="text-xs font-medium">
                                        Suite / Cabin
                                    </Label>
                                    <div className="relative">
                                        <DoorOpenIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            id="doc-room"
                                            type="text"
                                            placeholder="Room 101"
                                            value={room}
                                            onChange={(e) => setRoom(e.target.value)}
                                            className="pl-8 text-xs h-8"
                                        />
                                    </div>
                                </div>
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
                                    disabled={isSubmitting || !name.trim() || !email.trim() || !password.trim()}
                                    className="bg-primary text-primary-foreground font-medium"
                                >
                                    {isSubmitting ? "Provisioning..." : "Provision Doctor"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Doctor Dialog */}
                {editDoctor && (
                    <Dialog open={!!editDoctor} onOpenChange={(open) => !open && setEditDoctor(null)}>
                        <DialogContent className="sm:max-w-md p-5 sm:p-6">
                            <DialogHeader>
                                <DialogTitle className="text-base font-semibold">
                                    Edit {editDoctor.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Update specialty, consultation fee, or reset password.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleUpdateDoctor} className="flex flex-col gap-4 mt-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs font-medium">Specialty</Label>
                                    <Input
                                        type="text"
                                        value={editDoctor.specialty}
                                        onChange={(e) =>
                                            setEditDoctor({ ...editDoctor, specialty: e.target.value })
                                        }
                                        className="text-xs h-8"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-medium">Consultation Fee (₹)</Label>
                                        <Input
                                            type="number"
                                            value={editDoctor.consultation_fee}
                                            onChange={(e) =>
                                                setEditDoctor({
                                                    ...editDoctor,
                                                    consultation_fee: Number(e.target.value),
                                                })
                                            }
                                            className="text-xs h-8"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-medium">Room / Cabin</Label>
                                        <Input
                                            type="text"
                                            value={editDoctor.room || ""}
                                            onChange={(e) =>
                                                setEditDoctor({ ...editDoctor, room: e.target.value })
                                            }
                                            className="text-xs h-8"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs font-medium">
                                        Reset Password{" "}
                                        <span className="text-[11px] text-muted-foreground">(Leave empty to keep current)</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Enter new password..."
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                </div>

                                <DialogFooter className="mt-2 gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditDoctor(null)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isSubmitting}
                                        className="bg-primary text-primary-foreground font-medium"
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </Layout>
    );
}
