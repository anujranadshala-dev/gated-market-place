import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Modern Angular 21 Standalone Status Badge Component
 * Uses input signals (`input()`) for reactive color badge styling in light theme.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="badgeClasses()"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-xs"
    >
      <span class="w-1.5 h-1.5 mr-1.5 rounded-full" [class]="dotClass()"></span>
      {{ label() || status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input<string>();

  readonly badgeClasses = computed(() => {
    const s = this.status().toUpperCase().replace(/_/g, ' ');
    switch (s) {
      case 'ACTIVE':
      case 'DELIVERED':
      case 'PAID':
      case 'ACCEPTED':
      case 'PASSWORD CHANGED':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'PENDING':
      case 'PENDING APPROVAL':
      case 'PENDING FIRST LOGIN':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'PACKED':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
      case 'OUT FOR DELIVERY':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
      case 'SUSPENDED':
      case 'CANCELLED':
      case 'REVOKED':
      case 'EXPIRED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      case 'VIP BLACK':
        return 'bg-slate-900 dark:bg-slate-800 text-slate-100 dark:text-slate-100 border-slate-700 dark:border-slate-600 shadow-sm';
      case 'GOLD':
        return 'bg-amber-100/70 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700';
      case 'SILVER':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      case 'BRONZE':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';
      case 'PUBLIC MEMBER':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  });

  readonly dotClass = computed(() => {
    const s = this.status().toUpperCase().replace(/_/g, ' ');
    switch (s) {
      case 'ACTIVE':
      case 'DELIVERED':
      case 'PAID':
      case 'ACCEPTED':
      case 'PASSWORD CHANGED':
        return 'bg-emerald-500';
      case 'PENDING':
      case 'PENDING APPROVAL':
      case 'PENDING FIRST LOGIN':
        return 'bg-amber-500 animate-pulse';
      case 'PACKED':
        return 'bg-sky-500';
      case 'OUT FOR DELIVERY':
        return 'bg-indigo-500 animate-pulse';
      case 'SUSPENDED':
      case 'CANCELLED':
      case 'REVOKED':
      case 'EXPIRED':
        return 'bg-rose-500';
      case 'VIP BLACK':
        return 'bg-amber-400';
      case 'GOLD':
        return 'bg-amber-500';
      case 'SILVER':
        return 'bg-slate-400';
      case 'BRONZE':
        return 'bg-orange-400';
      default:
        return 'bg-slate-400';
    }
  });
}
