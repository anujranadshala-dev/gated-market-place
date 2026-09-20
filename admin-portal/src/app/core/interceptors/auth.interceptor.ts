import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { CsrfService } from '../services/csrf.service';
import { AuthStore } from '../auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const csrfService = inject(CsrfService);

  if (isMutating(req.method)) {
    return ensureCsrfToken(csrfService).pipe(
      switchMap(() => {
        const token = csrfService.getToken();
        const csrfReq = token
          ? req.clone({ setHeaders: { 'X-CSRF-Token': token } })
          : req;
        return next(csrfReq).pipe(
          catchError((error) => {
            if (error.status === 401) {
              console.warn('[HTTP 401] Unauthorized request detected, invalidating session.');
              authStore.logout();
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

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

function isMutating(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

function ensureCsrfToken(csrfService: CsrfService): Observable<void> {
  if (csrfService.getToken()) {
    return of(undefined);
  }
  return csrfService.fetchToken().pipe(
    take(1),
    switchMap(() => of(undefined))
  );
}
