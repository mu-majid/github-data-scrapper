import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SyncResponse, SyncStatusResponse } from '../models/github-sync.model';
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
  
  // Testing 
  syncJupyterTestData(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/github/sync-jupyter`, {});
  }
}