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

  readonly recipientEmail = signal<string>('');
  readonly recipientName = signal<string>('');
  readonly username = signal<string>('');
  readonly tempPassword = signal<string>('');
  readonly customMessage = signal<string>('');
  readonly showPasswordInForm = signal<boolean>(false);

  readonly isSubmitting = signal<boolean>(false);
  readonly lastDispatchedAccount = signal<CustomerInvitation | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly isPasswordModalOpen = signal<boolean>(false);
  readonly selectedAccountForPassword = signal<CustomerInvitation | null>(null);
  readonly modalNewPassword = signal<string>('');
  readonly modalShowPassword = signal<boolean>(false);

  readonly isSpendModalOpen = signal<boolean>(false);
  readonly selectedAccountForSpend = signal<CustomerInvitation | null>(null);
  readonly spendAddAmount = signal<number>(1500);

  readonly isSubscriptionModalOpen = signal<boolean>(false);
  readonly selectedAccountForSub = signal<CustomerInvitation | null>(null);
  readonly subPlanChoice = signal<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  readonly revealedPasswords = signal<Record<string, boolean>>({});
  readonly resettingPasswordId = signal<string | null>(null);

  readonly isEmailValid = computed<boolean>(() => {
    const email = this.recipientEmail().trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  });

  readonly isGmailEmail = computed<boolean>(() => {
    const email = this.recipientEmail().trim().toLowerCase();
    const regex = /^[^\s@]+@gmail\.com$/;
    return regex.test(email);
  });

  readonly isFormValid = computed<boolean>(() => {
    return this.isEmailValid() && this.isGmailEmail();
  });

  constructor() {
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

  public async dispatchCredentials(): Promise<void> {
    if (!this.isFormValid()) {
      this.showToast('Please provide a valid recipient email address.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const account = await this.invitationState.sendInvitation({
        storeId: this.authStore.assignedStoreId() || this.storeState.activeStore()?.id || '',
        recipientEmail: this.recipientEmail(),
        recipientName: this.recipientName() || undefined,
        username: this.username() || undefined,
        tempPassword: this.tempPassword() || undefined,
        customMessage: this.customMessage() || undefined,
        mustChangePassword: true,
      });

      this.lastDispatchedAccount.set(account);

      this.recipientEmail.set('');
      this.recipientName.set('');
      this.username.set('');
      this.customMessage.set('');
      this.generateNewFormPassword();

      this.showToast(
        `Credentials provisioned for ${account.recipientEmail}! Initial Tier: Bronze. An email has been sent with login details.`
      );
    } catch (error: any) {
      this.showToast(error.error?.message || 'Failed to provision credentials.');
    } finally {
      this.isSubmitting.set(false);
    }
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
    if (!account || !account.id || amount <= 0) return;

    this.invitationState.addCustomerSpend(account.id, amount);
    this.showToast(`Recorded $${amount.toLocaleString()} purchase for ${account.username || 'client'}. Tier updated!`);
    this.closeSpendModal();
  }

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
    if (!account.id) return;
    this.invitationState.toggleVipBlackSubscription(account.id, activate, plan);
    if (activate) {
      this.showToast(`VIP Black Concierge Subscription activated for ${account.username || 'client'}!`);
    } else {
      this.showToast(`VIP Black Subscription cancelled for ${account.username || 'client'}. Tier reverted to spend level.`);
    }
    this.closeSubscriptionModal();
  }

  public openPasswordModal(account: CustomerInvitation): void {
    this.selectedAccountForPassword.set(account);
    this.modalNewPassword.set('');
    this.modalShowPassword.set(false);
    this.isPasswordModalOpen.set(true);
  }

  public closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
    this.selectedAccountForPassword.set(null);
  }

  public async saveNewPassword(): Promise<void> {
    const account = this.selectedAccountForPassword();
    const pwd = this.modalNewPassword().trim();

    if (!account || !account.id || !pwd) {
      this.showToast('Please enter a valid password.');
      return;
    }

    this.resettingPasswordId.set(account.id);

    try {
      const newTemp = await this.invitationState.resetPassword(account.id);
      this.invitationState.changeClientPassword(account.id, newTemp, true);
      this.showToast(`Password for ${account.username || 'client'} successfully updated!`);
      this.closePasswordModal();
    } catch (error: any) {
      this.showToast(error.error?.message || 'Failed to reset password.');
    } finally {
      this.resettingPasswordId.set(null);
    }
  }

  public async revokeAccount(id: string): Promise<void> {
    await this.invitationState.deleteInvitation(id);
    this.showToast('Client access revoked.');
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
