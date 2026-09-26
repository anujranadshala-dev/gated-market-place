import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
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
      switchMap(() => sendWithCsrf(req, next, csrfService)),
      catchError((error) => {
        handleUnauthorized(error, authStore);
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error) => {
      handleUnauthorized(error, authStore);
      return throwError(() => error);
    })
  );
};

function isMutating(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

function handleUnauthorized(error: any, authStore: AuthStore): void {
  if (error?.status === 401) {
    console.warn('[HTTP 401] Unauthorized request detected, invalidating session.');
    authStore.logout();
  }
}

function sendWithCsrf(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  csrfService: CsrfService,
  retried = false
): Observable<any> {
  const token = csrfService.getToken();
  const csrfReq = token ? req.clone({ setHeaders: { 'X-CSRF-Token': token } }) : req;

  return next(csrfReq).pipe(
    catchError((error) => {
      // A cached CSRF token can go stale (cookie rotated, cleared, or expired).
      // Drop it and replay the request once so mutating calls - logout
      // included - are not permanently rejected with 403.
      if (error?.status === 403 && !retried) {
        csrfService.clearToken();
        return ensureCsrfToken(csrfService).pipe(
          switchMap(() => sendWithCsrf(req, next, csrfService, true))
        );
      }
      return throwError(() => error);
    })
  );
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
