import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ease-in-out"
          [class]="{
            'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200': toast.type === 'success',
            'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200': toast.type === 'error',
            'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200': toast.type === 'info'
          }"
        >
          @if (toast.type === 'success') {
            <CheckCircle class="w-5 h-5 shrink-0" />
          } @else if (toast.type === 'error') {
            <AlertCircle class="w-5 h-5 shrink-0" />
          } @else {
            <Info class="w-5 h-5 shrink-0" />
          }
          <p class="text-xs font-medium flex-1 leading-relaxed">{{ toast.message }}</p>
          <button
            (click)="toastService.removeToast(toast.id)"
            class="shrink-0 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
