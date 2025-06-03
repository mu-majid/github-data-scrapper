import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GitHubIntegration {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  connectedAt: string;
  lastSyncAt: string;
}

export interface AuthResponse {
  success: boolean;
  authenticated: boolean;
  integration?: GitHubIntegration;
  message?: string;
}

export interface OAuthResponse {
  success: boolean;
  authUrl: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly tokenKey = 'github_oauth_token';
  
  private authStatusSubject = new BehaviorSubject<AuthResponse | null>(null);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  initiateGitHubAuth(): Observable<OAuthResponse> {
    return this.http.get<OAuthResponse>(`${this.baseUrl}/auth/github`);
  }

  redirectToGitHub(): void {
    this.initiateGitHubAuth().subscribe({
      next: (response) => {
        if (response.success && response.authUrl) {
          window.location.href = response.authUrl;
        }
      },
      error: (error) => {
        console.error('Failed to initiate GitHub OAuth:', error);
      }
    });
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.checkAuthStatus();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.authStatusSubject.next(null);
  }

  checkAuthStatus(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/auth/status`).pipe(
      tap(response => {
        this.authStatusSubject.next(response);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.removeToken();
      })
    );
  }

  removeIntegration(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/auth/remove`).pipe(
      tap(() => {
        this.removeToken();
      })
    );
  }

  isAuthenticated(): boolean {
    const status = this.authStatusSubject.value;
    return !!(status?.success && status?.authenticated && this.getToken());
  }

  getIntegration(): GitHubIntegration | null {
    const status = this.authStatusSubject.value;
    return status?.integration || null;
  }
}