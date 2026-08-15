import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

/**
 * Functional HTTP Interceptor for Gated Marketplace API
 * Automatically attaches Bearer JWT authorization header from the reactive Signal Store.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  let authReq = req;

  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Marketplace-Context': 'B2B2C-Gated-v1',
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('[HTTP 401] Unauthorized request detected, invalidating session.');
        authStore.logout();
      }
      return throwError(() => error);
    })
  );
};
