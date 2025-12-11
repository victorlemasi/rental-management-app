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

    updateRentHistory: async (tenantId: string, historyId: string, data: { water?: number; electricity?: number; garbage?: number; security?: number }) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/rent-history/${historyId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update rent history');
        return response.json();
    },

    upsertCurrentMonthUtilities: async (tenantId: string, data: { water: number; electricity: number; garbage: number; security: number }) => {
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

    extendLease: async (tenantId: string, months: number) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/extend-lease`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ months }),
        });
        if (!response.ok) throw new Error('Failed to extend lease');
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
        const result = await response.json();
        if (result.user) {
            result.user = normalizeUser(result.user);
        }
        return result;
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
        const result = await response.json();
        if (result.user) {
            result.user = normalizeUser(result.user);
        }
        return result;
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

// Helper function to safely parse JSON and detect HTML responses
const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    // Check if response is HTML (indicates endpoint doesn't exist)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Settings API endpoints not available. Backend deployment may still be in progress.');
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid response from server');
    }
};

const normalizeUser = (user: any) => {
    if (user && user.profilePicture && user.profilePicture.startsWith('/uploads')) {
        const apiBase = API_BASE_URL.replace('/api', '');
        user.profilePicture = `${apiBase}${user.profilePicture}`;
    }
    return user;
};

// User Settings API
export const userAPI = {
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const user = await safeJsonParse(response);
        return normalizeUser(user);
    },

    updateProfile: async (data: { name?: string; email?: string; phone?: string; profilePicture?: string | File } | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: isFormData ? {
                ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
            } : getHeaders(),
            body: isFormData ? data : JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await safeJsonParse(response);
            throw new Error(error.message || 'Failed to update profile');
        }
        const result = await safeJsonParse(response);
        if (result.user) {
            result.user = normalizeUser(result.user);
        }
        return result;
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await safeJsonParse(response);
            throw new Error(error.message || 'Failed to change password');
        }
        return safeJsonParse(response);
    },

    getNotificationSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/users/notification-settings`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch notification settings');
        return safeJsonParse(response);
    },

    updateNotificationSettings: async (data: { email?: boolean; push?: boolean; sms?: boolean; monthlyReport?: boolean }) => {
        const response = await fetch(`${API_BASE_URL}/users/notification-settings`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update notification settings');
        return safeJsonParse(response);
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

// M-Pesa API
export const mpesaAPI = {
    stkPush: async (data: { phoneNumber: string; amount: number; accountReference: string }) => {
        const response = await fetch(`${API_BASE_URL}/mpesa/stk-push`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to initiate M-Pesa payment');
        return response.json();
    },

    checkStatus: async (checkoutRequestId: string) => {
        const response = await fetch(`${API_BASE_URL}/mpesa/query/${checkoutRequestId}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to check transaction status');
        }
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
