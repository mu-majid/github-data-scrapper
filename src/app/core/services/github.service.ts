import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SyncResponse {
  success: boolean;
  message: string;
  stats?: {
    organizations: number;
    repositories: number;
    commits: number;
    pullRequests: number;
    issues: number;
    users: number;
    syncDuration: string;
  };
}

export interface SyncStatusResponse {
  success: boolean;
  lastSyncAt: string;
  dataCounts: {
    organizations: number;
    repositories: number;
    commits: number;
    pullRequests: number;
    issues: number;
    users: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  syncGitHubData(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/github/sync`, {});
  }

  getSyncStatus(): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(`${this.baseUrl}/github/sync-status`);
  }

  getRateLimit(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/rate-limit`);
  }

  getOrganizations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/organizations`);
  }

  validateToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/validate-token`);
  }

  // Testing 
  syncJupyterTestData(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/github/sync-jupyter`, {});
  }
}