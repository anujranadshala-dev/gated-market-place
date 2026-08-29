import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CustomerInvitation,
  CustomerTier,
  SendInvitationDto,
  calculateCustomerTier,
  getCustomerTierProgress,
} from '../core/models/invitation.model';
import { AuthStore } from '../core/auth/auth.store';
import { StoreState } from './store.state';

const API_BASE_URL = 'http://localhost:5000/api';

export interface AdminClientUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  accessibleStores: string[];
  totalSpent: number;
  hasVipBlackSubscription: boolean;
  subscriptionPlan: string;
  assignedTier: string;
  status: string;
  tempPassword?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvitationState {
  private readonly authStore = inject(AuthStore);
  private readonly storeState = inject(StoreState);
  private readonly http = inject(HttpClient);

  private readonly _invitations = signal<CustomerInvitation[]>([]);
  private readonly _filterStatus = signal<string>('ALL');
  private readonly _loading = signal<boolean>(false);

  readonly invitations = this._invitations.asReadonly();
  readonly filterStatus = this._filterStatus.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly currentStoreInvitations = computed<CustomerInvitation[]>(() => {
    const assignedStoreId = this.authStore.assignedStoreId();
    if (!assignedStoreId) return [];
    return this._invitations().filter((inv) => inv.storeId === assignedStoreId);
  });

  readonly pendingInvitationsCount = computed<number>(() => {
    const list = this.authStore.isSuperAdmin() ? this._invitations() : this.currentStoreInvitations();
    return list.filter((i) => i.status === 'Pending First Login' || i.status === 'Pending').length;
  });

  readonly acceptedInvitationsCount = computed<number>(() => {
    const list = this.authStore.isSuperAdmin() ? this._invitations() : this.currentStoreInvitations();
    return list.filter((i) => i.status === 'Active' || i.status === 'Password Changed' || i.status === 'Accepted').length;
  });

  readonly conversionRate = computed<number>(() => {
    const list = this.authStore.isSuperAdmin() ? this._invitations() : this.currentStoreInvitations();
    if (list.length === 0) return 0;
    const active = list.filter((i) => i.status === 'Active' || i.status === 'Password Changed' || i.status === 'Accepted').length;
    return Math.round((active / list.length) * 100);
  });

  constructor() {
    this.fetchClientUsers();
  }

  public async fetchClientUsers(): Promise<void> {
    this._loading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<{ clientUsers: AdminClientUser[] }>(`${API_BASE_URL}/admin/clients`, { withCredentials: true })
      );

      if (response?.clientUsers) {
        const mapped: CustomerInvitation[] = response.clientUsers.map((u) => ({
          id: u.id,
          storeId: '',
          storeName: '',
          recipientEmail: u.email,
          recipientName: u.fullName,
          username: u.username,
          tempPassword: '',
          isTempPassword: u.status === 'Pending First Login',
          mustChangePassword: u.status === 'Pending First Login',
          passwordLastChangedAt: undefined,
          totalSpend: u.totalSpent,
          hasVipBlackSubscription: u.hasVipBlackSubscription,
          subscriptionPlan: u.subscriptionPlan as 'MONTHLY' | 'ANNUAL' | 'NONE',
          assignedTier: u.assignedTier as CustomerTier,
          inviteCode: u.username,
          customMessage: undefined,
          status: u.status as CustomerInvitation['status'],
          sentByUserId: '',
          sentAt: u.createdAt,
        }));
        this._invitations.set(mapped);
      }
    } catch (error) {
      console.error('Error fetching client users:', error);
      this._invitations.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  public async sendInvitation(dto: SendInvitationDto): Promise<CustomerInvitation> {
    const currentStoreId = this.authStore.assignedStoreId() || this.storeState.activeStore()?.id || '';

    const response = await firstValueFrom(
      this.http.post<{ clientUser: AdminClientUser }>(
        `${API_BASE_URL}/admin/clients`,
        {
          email: dto.recipientEmail,
          fullName: dto.recipientName || dto.recipientEmail,
          username: dto.username,
          storeId: currentStoreId,
          assignedTier: 'BRONZE',
        },
        { withCredentials: true }
      )
    );

    const created = response.clientUser;
    const initialTier = calculateCustomerTier(0, false);

    const newAccount: CustomerInvitation = {
      id: created.id,
      storeId: currentStoreId,
      storeName: '',
      recipientEmail: created.email,
      recipientName: created.fullName,
      username: created.username,
      tempPassword: created.tempPassword || dto.tempPassword || '',
      isTempPassword: true,
      mustChangePassword: true,
      passwordLastChangedAt: undefined,
      totalSpend: created.totalSpent,
      hasVipBlackSubscription: created.hasVipBlackSubscription,
      subscriptionPlan: created.subscriptionPlan as 'MONTHLY' | 'ANNUAL' | 'NONE',
      assignedTier: initialTier,
      inviteCode: created.username,
      customMessage: dto.customMessage,
      status: 'Pending First Login',
      sentByUserId: this.authStore.user()?.id || 'usr_unknown',
      sentAt: new Date().toISOString(),
    };

    this._invitations.update((accounts) => [newAccount, ...accounts]);
    return newAccount;
  }

  public async resetPassword(invitationId: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ tempPassword: string }>(
        `${API_BASE_URL}/admin/clients/${invitationId}/reset-password`,
        {},
        { withCredentials: true }
      )
    );

    this._invitations.update((accounts) =>
      accounts.map((acc) =>
        acc.id === invitationId
          ? { ...acc, status: 'Pending First Login' as const }
          : acc
      )
    );

    return response.tempPassword;
  }

  public async deleteInvitation(invitationId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<{ message: string }>(
        `${API_BASE_URL}/admin/clients/${invitationId}`,
        { withCredentials: true }
      )
    );

    this._invitations.update((accounts) => accounts.filter((acc) => acc.id !== invitationId));
  }

  // Keep local-only operations for spend simulation and VIP toggles
  public addCustomerSpend(accountId: string, amount: number): void {
    if (amount <= 0) return;

    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          const newSpend = acc.totalSpend + amount;
          const newTier = calculateCustomerTier(newSpend, acc.hasVipBlackSubscription);
          return { ...acc, totalSpend: newSpend, assignedTier: newTier };
        }
        return acc;
      })
    );
  }

  public toggleVipBlackSubscription(accountId: string, active: boolean, plan: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          const newTier = calculateCustomerTier(acc.totalSpend, active);
          return {
            ...acc,
            hasVipBlackSubscription: active,
            subscriptionPlan: active ? plan : 'NONE',
            assignedTier: newTier,
          };
        }
        return acc;
      })
    );
  }

  public changeClientPassword(accountId: string, newPassword: string, markAsTemp: boolean = false): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            tempPassword: newPassword,
            isTempPassword: markAsTemp,
            passwordLastChangedAt: new Date().toISOString(),
            status: 'Active' as const,
          };
        }
        return acc;
      })
    );
  }

  public revokeInvitation(invitationId: string): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => (acc.id === invitationId ? { ...acc, status: 'Revoked' } : acc))
    );
  }

  // Helpers
  public generateSecureTempPassword(storeName?: string): string {
    const prefix = storeName ? storeName.substring(0, 3).toUpperCase() : 'GAT';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '#', '$', '@'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `Tmp#${prefix}${randomDigits}${randomSymbol}`;
  }

  public suggestUsername(email: string, name?: string): string {
    if (name && name.trim()) {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
      return cleanName;
    }
    const cleanEmail = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '.');
    return cleanEmail || 'client.user';
  }
}
