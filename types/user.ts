export type UserRole = "customer" | "fixer" | "admin";

export type AccountStatus = "active" | "suspended" | "banned";

export interface FixerLocation {
    country: string;
    state: string;
    city: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

export interface FixerProfileSummary {
    id: string;
    bio: string | null;
    skills: string[];
    trade: string;
    yearsOfExperience: number;
    location: FixerLocation;
    profilePhoto: string | null;
    availabilityStatus: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string | null;
    name?: string;
    email: string;
    phone?: string | null;
    image?: string | null;
    role: UserRole;
    isVerified: boolean;
    accountStatus: AccountStatus;
    createdAt: string;
    fixerProfile?: FixerProfileSummary | null;
}

export type CustomerStatus = "active" | "suspended" | "banned";

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    location?: string;
    image?: string | null;
    status: CustomerStatus;
    isVerified: boolean;
    bookingsCount?: number;
    totalSpent?: number;
    createdAt: string;
}