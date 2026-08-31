const API_BASE = '/api/client';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

export const api = {
    async login(usernameOrEmail: string, password: string) {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password }),
            credentials: 'include',
        });
        return handleResponse<{ message: string; user: any }>(res);
    },

    async logout() {
        const res = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        return handleResponse<{ message: string }>(res);
    },

    async getMe() {
        const res = await fetch(`${API_BASE}/me`, {
            credentials: 'include',
        });
        return handleResponse<{ user: any }>(res);
    },

    async updateProfile(data: { fullName?: string; email?: string; mobileNumber?: string; avatarUrl?: string }) {
        const res = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return handleResponse<{ message: string; user: any }>(res);
    },

    async changePassword(currentPassword: string, newPassword: string) {
        const res = await fetch(`${API_BASE}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
            credentials: 'include',
        });
        return handleResponse<{ message: string }>(res);
    },

    async getStores() {
        const res = await fetch(`${API_BASE}/stores`, {
            credentials: 'include',
        });
        return handleResponse<{ stores: any[] }>(res);
    },

    async getProducts() {
        const res = await fetch(`${API_BASE}/products`, {
            credentials: 'include',
        });
        return handleResponse<{ products: any[] }>(res);
    },

    async getOrders() {
        const res = await fetch(`${API_BASE}/orders`, {
            credentials: 'include',
        });
        return handleResponse<{ orders: any[] }>(res);
    },

    async createOrder(orderData: any) {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include',
        });
        return handleResponse<{ message: string; orderId: string; orderNumber: string }>(res);
    },

    async addAddress(addressData: any) {
        const res = await fetch(`${API_BASE}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData),
            credentials: 'include',
        });
        return handleResponse<{ message: string; address: any; savedAddresses: any[]; address_: any }>(res);
    },

    async updateAddress(id: string, addressData: any) {
        const res = await fetch(`${API_BASE}/addresses/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData),
            credentials: 'include',
        });
        return handleResponse<{ message: string; address: any; savedAddresses: any[]; address_: any }>(res);
    },

    async deleteAddress(id: string) {
        const res = await fetch(`${API_BASE}/addresses/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return handleResponse<{ message: string; savedAddresses: any[]; address_: any }>(res);
    },

    async setDefaultAddress(id: string) {
        const res = await fetch(`${API_BASE}/addresses/${encodeURIComponent(id)}/default`, {
            method: 'PUT',
            credentials: 'include',
        });
        return handleResponse<{ message: string; address_: any; savedAddresses: any[] }>(res);
    },
};
