import { Injectable, computed, signal, inject } from '@angular/core';
import {
  CustomerInvitation,
  CustomerTier,
  SendInvitationDto,
  calculateCustomerTier,
} from '../core/models/invitation.model';
import { AuthStore } from '../core/auth/auth.store';
import { StoreState } from './store.state';

/**
 * Modern Angular 21 Signal Store for Gated Customer Access & Dynamic Tier Progression
 *
 * Tier Progression Logic:
 * 1. BRONZE ($0 - $2,499 spend) -> Initial baseline tier for all provisioned patrons.
 * 2. SILVER ($2,500 - $9,999 spend) -> Automatically unlocked as spend increases.
 * 3. GOLD ($10,000+ spend) -> Automatically unlocked as spend increases.
 * 4. VIP_BLACK -> Exclusively granted via VIP Concierge Membership Subscription.
 */
@Injectable({
  providedIn: 'root',
})
export class InvitationState {
  private readonly authStore = inject(AuthStore);
  private readonly storeState = inject(StoreState);

  // Initial Client Accounts Seed with Usernames, Passwords, Spend & Subscriptions
  private readonly _invitations = signal<CustomerInvitation[]>([
    {
      id: 'usr_client_101',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      recipientEmail: 'clara.montague@private-client.com',
      recipientName: 'Clara Montague',
      username: 'clara.montague',
      tempPassword: 'Password@2025!',
      isTempPassword: false,
      mustChangePassword: false,
      passwordLastChangedAt: '2025-02-02T14:30:00Z',
      totalSpend: 14500,
      hasVipBlackSubscription: true,
      subscriptionPlan: 'ANNUAL',
      subscriptionRenewsAt: '2026-02-01T00:00:00Z',
      assignedTier: 'VIP_BLACK',
      inviteCode: 'clara.montague',
      customMessage: 'Welcome to Vance Atelier’s bespoke trunk collection.',
      status: 'Active',
      sentByUserId: 'usr_owner_01',
      sentAt: '2025-02-01T10:00:00Z',
      acceptedAt: '2025-02-02T14:30:00Z',
    },
    {
      id: 'usr_client_102',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      recipientEmail: 'julian.vane@mayfair-bank.co.uk',
      recipientName: 'Julian Vane',
      username: 'julian.vane',
      tempPassword: 'Tmp#Vnc8812!',
      isTempPassword: true,
      mustChangePassword: false,
      totalSpend: 11200,
      hasVipBlackSubscription: false,
      subscriptionPlan: 'NONE',
      assignedTier: 'GOLD',
      inviteCode: 'julian.vane',
      customMessage: 'Private login credentials for our seasonal trunk access.',
      status: 'Active',
      sentByUserId: 'usr_owner_01',
      sentAt: '2025-02-12T14:00:00Z',
    },
    {
      id: 'usr_client_103',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      recipientEmail: 'daria.zheleznova@monaco-yachts.mc',
      recipientName: 'Daria Zheleznova',
      username: 'daria.z',
      tempPassword: 'Tmp#Vnc3309!',
      isTempPassword: true,
      mustChangePassword: false,
      totalSpend: 4800,
      hasVipBlackSubscription: true,
      subscriptionPlan: 'MONTHLY',
      subscriptionRenewsAt: '2025-03-13T00:00:00Z',
      assignedTier: 'VIP_BLACK',
      inviteCode: 'daria.z',
      customMessage: 'Your exclusive credentials to pre-order limited horology travel goods.',
      status: 'Active',
      sentByUserId: 'usr_owner_01',
      sentAt: '2025-02-13T09:15:00Z',
    },
    {
      id: 'usr_client_104',
      storeId: 'str_aethel_02',
      storeName: 'Aethelgard Rare Botanicals',
      recipientEmail: 'frederik.h@nordic-ventures.se',
      recipientName: 'Frederik Holm',
      username: 'frederik.holm',
      tempPassword: 'Tmp#Aet4478!',
      isTempPassword: true,
      mustChangePassword: false,
      totalSpend: 3600,
      hasVipBlackSubscription: false,
      subscriptionPlan: 'NONE',
      assignedTier: 'SILVER',
      inviteCode: 'frederik.holm',
      status: 'Active',
      sentByUserId: 'usr_owner_02',
      sentAt: '2025-02-10T11:00:00Z',
    },
    {
      id: 'usr_client_105',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      recipientEmail: 'oliver.sterling@harrods-vip.co.uk',
      recipientName: 'Oliver Sterling',
      username: 'oliver.sterling',
      tempPassword: 'Tmp#Vnc9102$',
      isTempPassword: true,
      mustChangePassword: false,
      totalSpend: 850,
      hasVipBlackSubscription: false,
      subscriptionPlan: 'NONE',
      assignedTier: 'BRONZE',
      inviteCode: 'oliver.sterling',
      status: 'Active',
      sentByUserId: 'usr_owner_01',
      sentAt: '2025-02-14T08:00:00Z',
    },
  ]);

  private readonly _filterStatus = signal<string>('ALL');

  // Readonly signals
  readonly invitations = this._invitations.asReadonly();
  readonly filterStatus = this._filterStatus.asReadonly();

  // Computed signals
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

  // Action methods
  public setFilterStatus(status: string): void {
    this._filterStatus.set(status);
  }

  /**
   * Helper: Generate a secure temporary password
   */
  public generateSecureTempPassword(storeName?: string): string {
    const prefix = storeName ? storeName.substring(0, 3).toUpperCase() : 'GAT';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '#', '$', '@'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `Tmp#${prefix}${randomDigits}${randomSymbol}`;
  }

  /**
   * Helper: Suggest a clean username from email or name
   */
  public suggestUsername(email: string, name?: string): string {
    if (name && name.trim()) {
      const cleanName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.');
      return cleanName;
    }
    const cleanEmail = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '.');
    return cleanEmail || 'client.user';
  }

  /**
   * Provision a new customer account with username and temporary password.
   * Starts at BRONZE tier ($0 spend, no manual tier assignment).
   * Tiers automatically advance to Silver and Gold as the customer spends,
   * while VIP Black is activated via subscription.
   */
  public sendInvitation(dto: SendInvitationDto): CustomerInvitation {
    const currentStore = this.storeState.stores().find((s) => s.id === dto.storeId);
    
    // Determine username
    const username = dto.username?.trim() || this.suggestUsername(dto.recipientEmail, dto.recipientName);
    
    // Determine temporary password
    const tempPassword = dto.tempPassword?.trim() || this.generateSecureTempPassword(currentStore?.name);
    
    const initialSpend = 0;
    const initialVipBlack = false;
    const initialTier = calculateCustomerTier(initialSpend, initialVipBlack);

    const newAccount: CustomerInvitation = {
      id: `usr_client_${Date.now().toString(36)}`,
      storeId: dto.storeId,
      storeName: currentStore?.name || 'Assigned Store',
      recipientEmail: dto.recipientEmail.toLowerCase().trim(),
      recipientName: dto.recipientName?.trim(),
      username,
      tempPassword,
      isTempPassword: true,
      mustChangePassword: dto.mustChangePassword ?? false,
      totalSpend: initialSpend,
      hasVipBlackSubscription: initialVipBlack,
      subscriptionPlan: 'NONE',
      assignedTier: initialTier,
      inviteCode: username,
      customMessage: dto.customMessage,
      status: 'Active',
      sentByUserId: this.authStore.user()?.id || 'usr_unknown',
      sentAt: new Date().toISOString(),
    };

    this._invitations.update((accounts) => [newAccount, ...accounts]);
    return newAccount;
  }

  /**
   * Add / record spend for a customer (e.g. from purchases or simulation).
   * Automatically elevates tier from Bronze -> Silver ($2,500+) -> Gold ($10,000+).
   */
  public addCustomerSpend(accountId: string, amount: number): void {
    if (amount <= 0) return;

    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          const newSpend = acc.totalSpend + amount;
          const newTier = calculateCustomerTier(newSpend, acc.hasVipBlackSubscription);
          return {
            ...acc,
            totalSpend: newSpend,
            assignedTier: newTier,
          };
        }
        return acc;
      })
    );
  }

  /**
   * Toggle VIP Black Subscription (Subscription-Based Tier)
   */
  public toggleVipBlackSubscription(
    accountId: string,
    active: boolean,
    plan: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'
  ): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          const newTier = calculateCustomerTier(acc.totalSpend, active);
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + (plan === 'ANNUAL' ? 1 : 0));
          if (plan === 'MONTHLY') nextYear.setMonth(nextYear.getMonth() + 1);

          return {
            ...acc,
            hasVipBlackSubscription: active,
            subscriptionPlan: active ? plan : 'NONE',
            subscriptionRenewsAt: active ? nextYear.toISOString() : undefined,
            assignedTier: newTier,
          };
        }
        return acc;
      })
    );
  }

  /**
   * Change or reset a user's password anytime
   */
  public changeClientPassword(
    accountId: string,
    newPassword: string,
    markAsTemp: boolean = false,
    requireChangeNextLogin: boolean = false
  ): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            tempPassword: newPassword,
            isTempPassword: markAsTemp,
            mustChangePassword: requireChangeNextLogin,
            passwordLastChangedAt: new Date().toISOString(),
            status: 'Active',
          };
        }
        return acc;
      })
    );
  }

  /**
   * Issue a newly generated temporary password for a client
   */
  public issueNewTempPassword(accountId: string): string {
    const target = this._invitations().find((a) => a.id === accountId);
    const newTemp = this.generateSecureTempPassword(target?.storeName);
    this.changeClientPassword(accountId, newTemp, true, false);
    return newTemp;
  }

  /**
   * Revoke client access
   */
  public revokeInvitation(invitationId: string): void {
    this._invitations.update((accounts) =>
      accounts.map((acc) => (acc.id === invitationId ? { ...acc, status: 'Revoked' } : acc))
    );
  }
}
