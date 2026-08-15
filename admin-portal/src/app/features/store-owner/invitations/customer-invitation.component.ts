import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvitationState } from '../../../state/invitation.state';
import { StoreState } from '../../../state/store.state';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  CustomerInvitation,
  CustomerTier,
  getCustomerTierProgress,
} from '../../../core/models/invitation.model';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

/**
 * Modern Angular 21 Standalone Customer Access & Credential Provisioning Component
 *
 * Tiering Architecture:
 * - Gated Tier is NOT manually assigned.
 * - New clients start at BRONZE ($0 spend).
 * - Tiers elevate automatically as client spends on store: Silver ($2,500+) -> Gold ($10,000+).
 * - VIP_BLACK is unlocked exclusively on a subscription basis.
 */
@Component({
  selector: 'app-customer-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './customer-invitation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerInvitationComponent {
  readonly invitationState = inject(InvitationState);
  readonly storeState = inject(StoreState);
  readonly authStore = inject(AuthStore);

  // Provisioning Form Signals (No manual tier selection!)
  readonly recipientEmail = signal<string>('');
  readonly recipientName = signal<string>('');
  readonly username = signal<string>('');
  readonly tempPassword = signal<string>('');
  readonly customMessage = signal<string>('');
  readonly showPasswordInForm = signal<boolean>(false);

  // Status & Feedback Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly lastDispatchedAccount = signal<CustomerInvitation | null>(null);
  readonly toastMessage = signal<string | null>(null);

  // Password Management Modal Signals
  readonly isPasswordModalOpen = signal<boolean>(false);
  readonly selectedAccountForPassword = signal<CustomerInvitation | null>(null);
  readonly modalNewPassword = signal<string>('');
  readonly modalIsTemp = signal<boolean>(true);
  readonly modalShowPassword = signal<boolean>(false);

  // Customer Spend Simulation Modal Signals
  readonly isSpendModalOpen = signal<boolean>(false);
  readonly selectedAccountForSpend = signal<CustomerInvitation | null>(null);
  readonly spendAddAmount = signal<number>(1500);

  // VIP Black Subscription Modal Signals
  readonly isSubscriptionModalOpen = signal<boolean>(false);
  readonly selectedAccountForSub = signal<CustomerInvitation | null>(null);
  readonly subPlanChoice = signal<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // Visibility toggle for table rows
  readonly revealedPasswords = signal<Record<string, boolean>>({});

  // Computed Validation Signals
  readonly isEmailValid = computed<boolean>(() => {
    const email = this.recipientEmail().trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  });

  readonly isFormValid = computed<boolean>(() => {
    return this.isEmailValid();
  });

  constructor() {
    // Generate an initial sample temporary password
    this.generateNewFormPassword();
  }

  public onEmailOrNameChange(): void {
    if (!this.username() || this.username().includes('.')) {
      const suggested = this.invitationState.suggestUsername(this.recipientEmail(), this.recipientName());
      this.username.set(suggested);
    }
  }

  public generateNewFormPassword(): void {
    const currentStoreName =
      this.authStore.assignedStoreName() || this.storeState.activeStore()?.name || 'Vance Atelier';
    const pwd = this.invitationState.generateSecureTempPassword(currentStoreName);
    this.tempPassword.set(pwd);
  }

  public toggleFormPasswordVisibility(): void {
    this.showPasswordInForm.update((v) => !v);
  }

  public toggleTableRowPassword(id: string): void {
    this.revealedPasswords.update((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  public getProgressInfo(account: CustomerInvitation) {
    return getCustomerTierProgress(account.totalSpend, account.hasVipBlackSubscription);
  }

  public dispatchCredentials(): void {
    if (!this.isFormValid()) {
      this.showToast('Please provide a valid recipient email address.');
      return;
    }

    const currentStoreId =
      this.authStore.assignedStoreId() || this.storeState.activeStore()?.id || 'str_vance_01';

    this.isSubmitting.set(true);

    setTimeout(() => {
      const account = this.invitationState.sendInvitation({
        storeId: currentStoreId,
        recipientEmail: this.recipientEmail(),
        recipientName: this.recipientName() || undefined,
        username: this.username() || undefined,
        tempPassword: this.tempPassword() || undefined,
        customMessage: this.customMessage() || undefined,
        mustChangePassword: false,
      });

      this.lastDispatchedAccount.set(account);
      this.isSubmitting.set(false);

      // Reset form signals & regenerate new temp password for next client
      this.recipientEmail.set('');
      this.recipientName.set('');
      this.username.set('');
      this.customMessage.set('');
      this.generateNewFormPassword();

      this.showToast(
        `Credentials provisioned for ${account.recipientEmail}! Initial Tier: Bronze ($0 spend).`
      );
    }, 400);
  }

  public copyText(text: string, label: string = 'Text'): void {
    navigator.clipboard?.writeText(text);
    this.showToast(`${label} copied to clipboard.`);
  }

  public copyFullCredentials(account: CustomerInvitation): void {
    const text = `Gated Access Credentials:\nUsername: ${account.username}\nTemporary Password: ${account.tempPassword}\nStore: ${account.storeName}\nTier: ${account.assignedTier}\n(You can change your password anytime later)`;
    navigator.clipboard?.writeText(text);
    this.showToast(`Full login credentials for ${account.username} copied to clipboard!`);
  }

  // --- Spend Simulation Modal ---
  public openSpendModal(account: CustomerInvitation): void {
    this.selectedAccountForSpend.set(account);
    this.spendAddAmount.set(1500);
    this.isSpendModalOpen.set(true);
  }

  public closeSpendModal(): void {
    this.isSpendModalOpen.set(false);
    this.selectedAccountForSpend.set(null);
  }

  public executeAddSpend(): void {
    const account = this.selectedAccountForSpend();
    const amount = Number(this.spendAddAmount());
    if (!account || amount <= 0) return;

    this.invitationState.addCustomerSpend(account.id, amount);
    this.showToast(`Recorded $${amount.toLocaleString()} purchase for ${account.username}. Tier updated!`);
    this.closeSpendModal();
  }

  // --- VIP Black Subscription Modal ---
  public openSubscriptionModal(account: CustomerInvitation): void {
    this.selectedAccountForSub.set(account);
    this.subPlanChoice.set(account.subscriptionPlan === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY');
    this.isSubscriptionModalOpen.set(true);
  }

  public closeSubscriptionModal(): void {
    this.isSubscriptionModalOpen.set(false);
    this.selectedAccountForSub.set(null);
  }

  public toggleSubscription(account: CustomerInvitation, activate: boolean): void {
    const plan = this.subPlanChoice();
    this.invitationState.toggleVipBlackSubscription(account.id, activate, plan);
    if (activate) {
      this.showToast(`VIP Black Concierge Subscription activated for ${account.username}!`);
    } else {
      this.showToast(`VIP Black Subscription cancelled for ${account.username}. Tier reverted to spend level.`);
    }
    this.closeSubscriptionModal();
  }

  // --- Password Reset / Change Modal Actions ---
  public openPasswordModal(account: CustomerInvitation): void {
    this.selectedAccountForPassword.set(account);
    const newTemp = this.invitationState.generateSecureTempPassword(account.storeName);
    this.modalNewPassword.set(newTemp);
    this.modalIsTemp.set(true);
    this.modalShowPassword.set(true);
    this.isPasswordModalOpen.set(true);
  }

  public closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
    this.selectedAccountForPassword.set(null);
  }

  public generateModalTempPassword(): void {
    const account = this.selectedAccountForPassword();
    const newTemp = this.invitationState.generateSecureTempPassword(account?.storeName);
    this.modalNewPassword.set(newTemp);
    this.modalIsTemp.set(true);
  }

  public saveNewPassword(): void {
    const account = this.selectedAccountForPassword();
    const pwd = this.modalNewPassword().trim();

    if (!account || !pwd) {
      this.showToast('Please enter a valid password.');
      return;
    }

    this.invitationState.changeClientPassword(
      account.id,
      pwd,
      this.modalIsTemp(),
      false
    );

    this.showToast(`Password for ${account.username} successfully updated!`);
    this.closePasswordModal();
  }

  public revokeAccount(id: string): void {
    this.invitationState.revokeInvitation(id);
    this.showToast('Client access revoked.');
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
