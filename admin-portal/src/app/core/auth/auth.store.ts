import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession, LoginCredentials, SignupPayload, User, UserRole, BackendLoginResponse } from './auth.models';
import { HttpClient } from '@angular/common/http';

/**
 * Modern Angular 21 Signal-Based Authentication Store
 * Handles session tokens, reactive user identity, RBAC checks, and persona swapping for portfolio demo.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient)
  private readonly baseUrl = 'http://localhost:5000'

  // Private Writable Signals
  private readonly _currentUser = signal<User | null>({
    id: 'usr_owner_01',
    name: 'Eleanor Vance',
    email: 'eleanor@vance-atelier.com',
    role: 'STORE_OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedStoreId: 'str_vance_01',
    assignedStoreName: 'Vance Luxury Atelier',
    createdAt: '2025-01-15T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
    isVerified: true,
  });

  private readonly _token = signal<string | null>('mock_jwt_session_token_b2b2c_gated_01');
  private readonly _isLoading = signal<boolean>(false);
  private readonly _authError = signal<string | null>(null);

  // Public Read-Only Computed Signals
  readonly user = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();

  readonly isAuthenticated = computed<boolean>(() => !!this._currentUser() && !!this._token());
  readonly userRole = computed<UserRole | null>(() => this._currentUser()?.role ?? null);
  readonly isSuperAdmin = computed<boolean>(() => this._currentUser()?.role === 'SUPER_ADMIN');
  readonly isStoreOwner = computed<boolean>(() => this._currentUser()?.role === 'STORE_OWNER');
  readonly assignedStoreId = computed<string | null>(() => this._currentUser()?.assignedStoreId ?? null);
  readonly assignedStoreName = computed<string | null>(() => this._currentUser()?.assignedStoreName ?? null);

  constructor() {
    // Reactive audit effect
    effect(() => {
      const user = this.user();
      if (user) {
        // Log telemetry or sync permissions
        console.debug(`[AuthStore Signal] Active session verified: ${user.name} (${user.role})`);
      }
    });
  }

  /**
   * Seamless Persona Switcher for Evaluation / Portfolio Demo
   */
  public switchPersona(role: UserRole, targetStoreId?: string, targetStoreName?: string): void {
    this._isLoading.set(true);
    this._authError.set(null);

    if (role === 'SUPER_ADMIN') {
      this._currentUser.set({
        id: 'usr_super_root',
        name: 'Alexander Sterling',
        email: 'alexander@gatedpulse-platform.io',
        role: 'SUPER_ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2024-11-01T00:00:00Z',
        lastLoginAt: new Date().toISOString(),
        isVerified: true,
      });
      this._token.set('mock_jwt_super_admin_omnipotent_token');
      this._isLoading.set(false);
      this.router.navigate(['/super-admin/dashboard']);
    } else if (role === 'STORE_OWNER') {
      const storeId = targetStoreId || 'str_vance_01';
      const storeName = targetStoreName || 'Vance Luxury Atelier';
      this._currentUser.set({
        id: 'usr_owner_01',
        name: 'Eleanor Vance',
        email: 'eleanor@vance-atelier.com',
        role: 'STORE_OWNER',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        assignedStoreId: storeId,
        assignedStoreName: storeName,
        createdAt: '2025-01-15T08:00:00Z',
        lastLoginAt: new Date().toISOString(),
        isVerified: true,
      });
      this._token.set('mock_jwt_store_owner_token');
      this._isLoading.set(false);
      this.router.navigate(['/store-owner/dashboard']);
    }
  }

  /**
   * Authenticate via credentials
   */
  public login(credentials: LoginCredentials): Promise<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return new Promise((resolve) => {
      this.httpClient.post<BackendLoginResponse>(`${this.baseUrl}/api/login`, credentials).subscribe({
        next: (res) => {
          this._currentUser.set({
            id: res._id,
            name: res.name,
            email: res.email,
            role: res.role,
            assignedStoreId: res.assignedStoreId,
            assignedStoreName: res.assignedStoreName,
            createdAt: res.createdAt,
            lastLoginAt: new Date().toISOString(),
            isVerified: res.isVerified,
          });
          // this._token.set(res.token);
          this.router.navigate([res.role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/store-owner/dashboard']);
        },
        error: (err) => {
          this._authError.set(err.message ?? 'Login failed');
        },
      });
      // setTimeout(() => {
      //   if (credentials.email.includes('admin') || credentials.role === 'SUPER_ADMIN') {
      //     this.switchPersona('SUPER_ADMIN');
      //   } else {
      //     this.switchPersona('STORE_OWNER', credentials.storeId);
      //   }
      //   this._isLoading.set(false);
      //   resolve(true);
      // }, 300);
    });
  }

  /**
   * Register a new user account
   */
  public signup(payload: SignupPayload): Promise<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return new Promise((resolve) => {
      // setTimeout(() => {
      //   if (payload.role === 'SUPER_ADMIN') {
      //     this.switchPersona('SUPER_ADMIN');
      //   } else {
      //     this.switchPersona('STORE_OWNER', payload.storeId, payload.storeName);
      //   }
      //   this._isLoading.set(false);
      //   resolve(true);
      // }, 300);
    });
  }

  /**
   * Terminate Active Session
   */
  public logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(['/login']);
  }
}
