export type AppointmentStatus =
    | 'Confirmed'
    | 'In Progress'
    | 'Scheduled'
    | 'Completed'
    | 'Cancelled'
    | 'Pending'
    | 'Awaiting Confirmation';

export type AppointmentType =
    | 'Initial Consultation'
    | 'Follow-up'
    | 'Procedure'
    | 'Health Check';

export interface Appointment {
    id: number;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    service: string;
    doctor: string;
    doctor_id?: number;
    date: string;
    time: string;
    dateTimeFormatted?: string;
    status: AppointmentStatus;
    type: AppointmentType;
    room?: string;
    duration?: string;
    leadId?: number;
    lead_id?: number;
    notes?: string;
    source?: string;
    requestedAt?: string;
    patientConfirmedAt?: string | null;
    doctorConfirmedAt?: string | null;
    isFullyConfirmed?: boolean;
    confirmationStatus?: string;
}
