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