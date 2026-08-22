import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('[HTTP 401] Unauthorized request detected, invalidating session.');
        authStore.logout();
      }
      return throwError(() => error);
    })
  );
};
