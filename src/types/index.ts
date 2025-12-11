export interface Property {
    _id: string;
    id?: string;
    name: string;
    address: string;
    type: 'apartment' | 'house' | 'condo' | 'commercial';
    units: number;
    occupiedUnits: number;
    monthlyRent: number;
    status: 'active' | 'maintenance' | 'vacant';
    imageUrl?: string;
    amenities: string[];
    yearBuilt: number;
    paymentAccountNumber?: string;
    paymentAccountName?: string;
}

export interface Tenant {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone: string;
    propertyId: Property | string;
    unitNumber: string;
    leaseStart: string;
    leaseEnd: string;
    monthlyRent: number;
    balance: number;
    currentMonth: string;
    status: 'active' | 'pending' | 'expired';
    paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial';
}

export interface MaintenanceRequest {
    _id: string;
    id?: string;
    propertyId: Property | string;
    unitNumber: string;
    tenantName: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    _id: string;
    id?: string;
    tenantId: Tenant | string;
    tenantName: string;
    propertyName: string;
    amount: number;
    date: string;
    month?: string; // YYYY-MM format
    status: 'completed' | 'pending' | 'failed';
    method: 'bank-transfer' | 'credit-card' | 'cash' | 'check' | 'mpesa';
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'tenant';
    profilePicture?: string;
}
