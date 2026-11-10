export interface DoctorProfile {
    id: number;
    user_id?: number;
    name: string;
    specialty: string;
    phone?: string;
    email: string;
    consultation_fee: number;
    room?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'doctor';
    avatar?: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    doctor?: DoctorProfile;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    doctor?: DoctorProfile | null;
    role?: 'admin' | 'doctor';
};

export type LoginFormData = {
    email: string;
    password: string;
};
