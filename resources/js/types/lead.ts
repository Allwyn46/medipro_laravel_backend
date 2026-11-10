export type LeadStatus =
    | 'New'
    | 'Contacted'
    | 'Consultation Scheduled'
    | 'Treatment Plan Sent'
    | 'Won'
    | 'Lost';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending';

export interface LeadActivity {
    id: number;
    type: 'Call' | 'Email' | 'Consultation' | 'Note' | 'Status Change';
    title: string;
    description: string;
    doctor?: string;
    date: string;
}

export interface LeadFormField {
    id: number;
    label: string;
    name: string;
    type: 'text' | 'dropdown';
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    service: string;
    status: LeadStatus;
    priority: LeadPriority;
    value: number;
    payment_status?: PaymentStatus;
    paymentStatus?: PaymentStatus;
    doctor: string;
    source: string;
    createdAt: string;
    lastContactDate: string;
    notes?: string;
    custom_fields?: Record<string, any>;
    activities: LeadActivity[];
}
