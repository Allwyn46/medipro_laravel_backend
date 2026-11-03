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
    dateTimeFormatted: string;
    status: AppointmentStatus;
    type: AppointmentType;
    room: string;
    duration: string;
    leadId?: number;
    notes?: string;
    source?: string;
    requestedAt?: string;
}

export const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: 1,
        patientName: 'Sarah Connor',
        patientEmail: 'sarah.connor@example.com',
        patientPhone: '+1 (555) 234-5678',
        service: 'Dental Implants',
        doctor: 'Dr. Eddie Lake',
        date: 'Today',
        time: '09:30 AM',
        dateTimeFormatted: 'Today at 09:30 AM',
        status: 'In Progress',
        type: 'Initial Consultation',
        room: 'Suite 201 - Dental',
        duration: '45 mins',
        leadId: 1,
        notes: 'Pre-op 3D CT scan review for upper molar implant.',
    },
    {
        id: 2,
        patientName: 'Michael Chen',
        patientEmail: 'michael.chen@example.com',
        patientPhone: '+1 (555) 345-6789',
        service: 'Orthodontics & Aligners',
        doctor: 'Dr. Jamik Tashpulatov',
        date: 'Today',
        time: '11:00 AM',
        dateTimeFormatted: 'Today at 11:00 AM',
        status: 'Confirmed',
        type: 'Procedure',
        room: 'Room 104 - Ortho',
        duration: '60 mins',
        leadId: 2,
        notes: 'Fitting first set of clear aligners and attachment bonding.',
    },
    {
        id: 3,
        patientName: 'Emma Watson',
        patientEmail: 'emma.watson@example.com',
        patientPhone: '+1 (555) 456-7890',
        service: 'Cardiology Checkup',
        doctor: 'Dr. Emily Whalen',
        date: 'Today',
        time: '02:15 PM',
        dateTimeFormatted: 'Today at 02:15 PM',
        status: 'Confirmed',
        type: 'Follow-up',
        room: 'Clinic 3B - Cardiac',
        duration: '30 mins',
        leadId: 3,
        notes: 'Review 48-hour Holter monitor and resting ECG results.',
    },
    {
        id: 4,
        patientName: 'David Rodriguez',
        patientEmail: 'david.rodriguez@example.com',
        patientPhone: '+1 (555) 567-8901',
        service: 'Dermatology & Laser Therapy',
        doctor: 'Dr. Eddie Lake',
        date: 'Today',
        time: '04:00 PM',
        dateTimeFormatted: 'Today at 04:00 PM',
        status: 'Scheduled',
        type: 'Initial Consultation',
        room: 'Laser Suite 1',
        duration: '30 mins',
        leadId: 4,
        notes: 'Skin patch test and laser resurfacing protocol consultation.',
    },
    {
        id: 5,
        patientName: 'Robert Martinez',
        patientEmail: 'robert.martinez@example.com',
        patientPhone: '+1 (555) 789-0123',
        service: 'Knee Arthroscopy & Rehab',
        doctor: 'Dr. Emily Whalen',
        date: 'Tomorrow',
        time: '10:00 AM',
        dateTimeFormatted: 'Tomorrow at 10:00 AM',
        status: 'Confirmed',
        type: 'Initial Consultation',
        room: 'Room 102 - Ortho',
        duration: '45 mins',
        leadId: 6,
        notes: 'Review lateral meniscus MRI scans and range of motion.',
    },
    {
        id: 6,
        patientName: 'Jessica Taylor',
        patientEmail: 'jessica.taylor@example.com',
        patientPhone: '+1 (555) 678-9012',
        service: 'Cosmetic Veneers',
        doctor: 'Dr. Jamik Tashpulatov',
        date: 'Tomorrow',
        time: '01:30 PM',
        dateTimeFormatted: 'Tomorrow at 01:30 PM',
        status: 'Scheduled',
        type: 'Procedure',
        room: 'Suite 203 - Aesthetic',
        duration: '90 mins',
        leadId: 5,
        notes: 'First phase preparation for 6 porcelain veneers.',
    },
    {
        id: 7,
        patientName: 'Amanda White',
        patientEmail: 'amanda.white@example.com',
        patientPhone: '+1 (555) 890-1234',
        service: 'Pediatric Health Screening',
        doctor: 'Dr. Eddie Lake',
        date: 'Tomorrow',
        time: '03:45 PM',
        dateTimeFormatted: 'Tomorrow at 03:45 PM',
        status: 'Scheduled',
        type: 'Health Check',
        room: 'Pediatrics Room 2',
        duration: '30 mins',
        leadId: 7,
        notes: 'Growth milestone evaluation and routine immunizations.',
    },
    {
        id: 8,
        patientName: 'Sophia Martinez',
        patientEmail: 'sophia.m@example.com',
        patientPhone: '+1 (555) 234-8901',
        service: 'Executive Health Screening',
        doctor: 'Dr. Jamik Tashpulatov',
        date: 'Nov 6',
        time: '09:00 AM',
        dateTimeFormatted: 'Nov 6 at 09:00 AM',
        status: 'Confirmed',
        type: 'Health Check',
        room: 'Executive Lounge A',
        duration: '120 mins',
        leadId: 11,
        notes: 'Comprehensive executive physical, fasting bloodwork, and ultrasound.',
    },
    {
        id: 9,
        patientName: 'Olivia Wilson',
        patientEmail: 'olivia.wilson@example.com',
        patientPhone: '+1 (555) 012-3456',
        service: 'Cataract Assessment',
        doctor: 'Dr. Emily Whalen',
        date: 'Nov 6',
        time: '11:30 AM',
        dateTimeFormatted: 'Nov 6 at 11:30 AM',
        status: 'Scheduled',
        type: 'Follow-up',
        room: 'Ophthalmology Suite',
        duration: '30 mins',
        leadId: 9,
        notes: 'Biometry measurements for premium intraocular lens.',
    },
    {
        id: 10,
        patientName: 'Daniel Black',
        patientEmail: 'daniel.black@example.com',
        patientPhone: '+1 (555) 901-2345',
        service: 'Physiotherapy Program',
        doctor: 'Dr. Jamik Tashpulatov',
        date: 'Nov 7',
        time: '02:00 PM',
        dateTimeFormatted: 'Nov 7 at 02:00 PM',
        status: 'Scheduled',
        type: 'Procedure',
        room: 'Rehab Gym 1',
        duration: '60 mins',
        leadId: 8,
        notes: 'Session 1 of 10-week spinal rehabilitation protocol.',
    },
];

export const INITIAL_PENDING_APPOINTMENTS: Appointment[] = [
    {
        id: 101,
        patientName: 'Alex Henderson',
        patientEmail: 'alex.henderson@example.com',
        patientPhone: '+1 (555) 321-9876',
        service: 'Dental Implants & Cosmetic',
        doctor: 'Dr. Eddie Lake',
        date: 'Today',
        time: '03:00 PM',
        dateTimeFormatted: 'Today at 03:00 PM',
        status: 'Pending',
        type: 'Initial Consultation',
        room: 'Dental Suite 1',
        duration: '45 mins',
        notes: 'Interested in upper full-arch smile makeover and veneer consultation.',
        source: 'Website Booking',
        requestedAt: '12 mins ago',
    },
    {
        id: 102,
        patientName: 'Hannah Vance',
        patientEmail: 'hannah.v@example.com',
        patientPhone: '+1 (555) 765-4321',
        service: 'Orthodontics & Clear Aligners',
        doctor: 'Dr. Jamik Tashpulatov',
        date: 'Tomorrow',
        time: '11:30 AM',
        dateTimeFormatted: 'Tomorrow at 11:30 AM',
        status: 'Pending',
        type: 'Initial Consultation',
        room: 'Ortho Studio B',
        duration: '30 mins',
        notes: 'Submitted online request for digital bite scan & transparent aligners evaluation.',
        source: 'Website Booking',
        requestedAt: '35 mins ago',
    },
    {
        id: 103,
        patientName: 'Carlos Ramirez',
        patientEmail: 'carlos.r@example.com',
        patientPhone: '+1 (555) 987-6543',
        service: 'Cardiology & Heart Health',
        doctor: 'Dr. Emily Whalen',
        date: 'Tomorrow',
        time: '04:15 PM',
        dateTimeFormatted: 'Tomorrow at 04:15 PM',
        status: 'Pending',
        type: 'Follow-up',
        room: 'Cardiology 2',
        duration: '30 mins',
        notes: 'Referred for follow-up blood pressure review and resting ECG.',
        source: 'Website Booking',
        requestedAt: '1 hour ago',
    },
];
