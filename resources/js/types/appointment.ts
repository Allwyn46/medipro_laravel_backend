export type AppointmentStatus =
    | 'Confirmed'
    | 'In Progress'
    | 'Scheduled'
    | 'Completed'
    | 'Cancelled'
    | 'Pending';

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
    service: string;
    doctor: string;
    date: string;
    time: string;
    dateTimeFormatted?: string;
    status: AppointmentStatus;
    type: AppointmentType;
    room?: string;
    duration?: string;
    leadId?: number;
    notes?: string;
    source?: string;
    requestedAt?: string;
}
