export type LeadStatus =
    | 'New'
    | 'Contacted'
    | 'Consultation Scheduled'
    | 'Treatment Plan Sent'
    | 'Won'
    | 'Lost';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export interface LeadActivity {
    id: number;
    type: 'Call' | 'Email' | 'Consultation' | 'Note' | 'Status Change';
    title: string;
    description: string;
    doctor?: string;
    date: string;
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
    doctor: string;
    source: string;
    createdAt: string;
    lastContactDate: string;
    notes?: string;
    activities: LeadActivity[];
}
