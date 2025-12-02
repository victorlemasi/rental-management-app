const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Properties API
export const propertiesAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/properties`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch property');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/properties`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create property');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update property');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete property');
        return response.json();
    },
};

// Tenants API
export const tenantsAPI = {
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/tenants/me`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch tenant profile');
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/tenants`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch tenants');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch tenant');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/tenants`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create tenant');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update tenant');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete tenant');
        return response.json();
    },

    getRentHistory: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}/rent-history`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch rent history');
        return response.json();
    },

    updateRentHistory: async (tenantId: string, historyId: string, data: { water?: number; electricity?: number; garbage?: number }) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/rent-history/${historyId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update rent history');
        return response.json();
    },

    upsertCurrentMonthUtilities: async (tenantId: string, data: { water: number; electricity: number; garbage: number }) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/rent-history/current`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update utilities');
        return response.json();
    },

    recordPayment: async (tenantId: string, data: { amount: number; month?: string; transactionId?: string }) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/record-payment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to record payment');
        return response.json();
    },
};

// Maintenance API
export const maintenanceAPI = {
    getMyRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/maintenance/my-requests`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch my maintenance requests');
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/maintenance`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch maintenance requests');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch maintenance request');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/maintenance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create maintenance request');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update maintenance request');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete maintenance request');
        return response.json();
    },
};

// Payments API
export const paymentsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch payment');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create payment');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update payment');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete payment');
        return response.json();
    },
};

// Auth API
export const authAPI = {
    login: async (credentials: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    register: async (userData: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    forgotPassword: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process request');
        }
        return response.json();
    },

    resetPassword: async (data: { email: string; token: string; newPassword: string }) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }
        return response.json();
    },
};

// M-PESA API
export const mpesaAPI = {
    initiateSTKPush: async (data: { phoneNumber: string; amount: number; email: string }) => {
        const response = await fetch(`${API_BASE_URL}/mpesa/stk-push`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to initiate STK Push');
        }
        return response.json();
    },

    checkStatus: async (transactionId: string) => {
        const response = await fetch(`${API_BASE_URL}/mpesa/status`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ transactionId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to check transaction status');
        }
        return response.json();
    },
};

// Notifications API
export const notificationsAPI = {
    getMyNotifications: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications/my-notifications`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create notification');
        return response.json();
    },

    markAsRead: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    },
};

// Helper to get headers with token
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
