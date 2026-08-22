import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials, SignupPayload, User, UserRole, BackendLoginResponse, BackendMeResponse, BackendRegisterResponse } from './auth.models';

const API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _authError = signal<string | null>(null);
  private _autoLoginPromise: Promise<boolean> | null = null;

  readonly user = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();

  readonly isAuthenticated = computed<boolean>(() => !!this._currentUser());
  readonly userRole = computed<UserRole | null>(() => this._currentUser()?.role ?? null);
  readonly isSuperAdmin = computed<boolean>(() => this._currentUser()?.role === 'SUPER_ADMIN');
  readonly isStoreOwner = computed<boolean>(() => this._currentUser()?.role === 'STORE_OWNER');
  readonly assignedStoreId = computed<string | null>(() => this._currentUser()?.assignedStoreId ?? null);
  readonly assignedStoreName = computed<string | null>(() => this._currentUser()?.assignedStoreName ?? null);

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        console.debug(`[AuthStore Signal] Active session verified: ${user.name} (${user.role})`);
      }
    });
  }

  public login(credentials: LoginCredentials): Promise<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return new Promise((resolve) => {
      this.http.post<BackendLoginResponse>(`${API_BASE_URL}/login`, {
        email: credentials.email,
        password: credentials.password,
      }, { withCredentials: true }).subscribe({
        next: () => {
          this.http.get<BackendMeResponse>(`${API_BASE_URL}/me`, { withCredentials: true }).subscribe({
            next: (meRes) => {
              const user = meRes.user;
              this._currentUser.set({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                assignedStoreId: user.assignedStoreId,
                createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
                lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : new Date().toISOString(),
                isVerified: true,
                avatarUrl: user.avatarUrl
              });
              this._isLoading.set(false);
              this.navigateByRole(user.role);
              resolve(true);
            },
            error: (err) => {
              this._authError.set(err.error?.message || 'Failed to fetch user profile');
              this._isLoading.set(false);
              resolve(false);
            },
          });
        },
        error: (err) => {
          this._authError.set(err.error?.message || 'Login failed');
          this._isLoading.set(false);
          resolve(false);
        },
      });
    });
  }

  public signup(payload: SignupPayload): Promise<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return new Promise((resolve) => {
      this.http.post<BackendRegisterResponse>(`${API_BASE_URL}/register`, {
        email: payload.email,
        name: payload.name,
        password: payload.password,
        role: payload.role,
      }, { withCredentials: true }).subscribe({
        next: () => {
          this.login({
            email: payload.email,
            password: payload.password,
            role: payload.role,
          }).then((success) => {
            resolve(success);
          });
        },
        error: (err) => {
          this._authError.set(err.error?.message || 'Sign up failed');
          this._isLoading.set(false);
          resolve(false);
        },
      });
    });
  }

  private navigateByRole(role: UserRole): void {
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin/dashboard']);
    } else {
      this.router.navigate(['/store-owner/dashboard']);
    }
  }

  public tryAutoLogin(): Promise<boolean> {
    if (this._autoLoginPromise) {
      return this._autoLoginPromise;
    }

    this._autoLoginPromise = new Promise((resolve) => {
      this.http.get<BackendMeResponse>(`${API_BASE_URL}/me`, { withCredentials: true }).subscribe({
        next: (meRes) => {
          const user = meRes.user;
          this._currentUser.set({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            assignedStoreId: user.assignedStoreId,
            createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
            lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : new Date().toISOString(),
            isVerified: true,
            avatarUrl: user.avatarUrl
          });
          resolve(true);
        },
        error: () => {
          this._currentUser.set(null);
          resolve(false);
        },
      });
    });

    return this._autoLoginPromise;
  }

  public logout(): void {
    this.http.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      },
    });
  }
}
