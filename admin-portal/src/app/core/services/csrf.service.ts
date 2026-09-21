import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

interface CsrfResponse {
    csrfToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class CsrfService {
    private readonly http = inject(HttpClient);
    private readonly _csrfToken$ = new BehaviorSubject<string | null>(null);
    private readonly _fetching$ = new BehaviorSubject<boolean>(false);

    getToken(): string | null {
        return this._csrfToken$.getValue();
    }

    fetchToken(): Observable<CsrfResponse> {
        if (this._csrfToken$.getValue()) {
            return new Observable((sub) => {
                sub.next({ csrfToken: this._csrfToken$.getValue()! });
                sub.complete();
            });
        }

        if (this._fetching$.getValue()) {
            return new Observable((sub) => {
                const sub2 = this._csrfToken$.subscribe((token) => {
                    if (token) {
                        sub.next({ csrfToken: token });
                        sub.complete();
                        sub2.unsubscribe();
                    }
                });
            });
        }

        this._fetching$.next(true);
        return this.http.get<CsrfResponse>(`${API_BASE_URL}/csrf-token`, { withCredentials: true }).pipe(
            tap((res) => {
                this._csrfToken$.next(res.csrfToken);
                this._fetching$.next(false);
            }),
            catchError((err) => {
                this._fetching$.next(false);
                return throwError(() => err);
            })
        );
    }
}
