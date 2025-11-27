const API_BASE_URL = 'http://localhost:5000/api';

// Properties API
export const propertiesAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/properties`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`);
        if (!response.ok) throw new Error('Failed to fetch property');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/properties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create property');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update property');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete property');
        return response.json();
    },
};

// Tenants API
export const tenantsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/tenants`);
        if (!response.ok) throw new Error('Failed to fetch tenants');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`);
        if (!response.ok) throw new Error('Failed to fetch tenant');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/tenants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create tenant');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update tenant');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete tenant');
        return response.json();
    },
};

// Maintenance API
export const maintenanceAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/maintenance`);
        if (!response.ok) throw new Error('Failed to fetch maintenance requests');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`);
        if (!response.ok) throw new Error('Failed to fetch maintenance request');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create maintenance request');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update maintenance request');
        return response.json();
    },

    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete maintenance request');
        return response.json();
    },
};

// Payments API
export const paymentsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/payments`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        return response.json();
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch payment');
        return response.json();
    },

    create: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create payment');
        return response.json();
    },

    update: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
};

// M-PESA API
export const mpesaAPI = {
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

// Helper to get headers with token
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
