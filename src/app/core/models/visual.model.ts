// Interfaces
export interface Author {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface Commit {
  _id: string;
  hash: string;
  message: string;
  author: Author;
  createdAt: string;
  repositoryId: number;
}

export interface PullRequest {
  _id: string;
  number: number;
  title: string;
  status: string;
  author: Author;
  createdAt: string;
  repositoryId: number;
}

export interface Issue {
  _id: string;
  number: number;
  title: string;
  state: string;
  author: Author;
  createdAt: string;
  repositoryId: number;
}

export interface Repository {
  id: string;
  repositoryId: number;
  name: string;
  description: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  openPullRequests: number;
  openIssues: number;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  hasNextPage: {
    commits: boolean;
    pullRequests: boolean;
    issues: boolean;
  };
}

export interface ApiResponse {
  success: boolean;
  data: {
    _id: string;
    repository: Repository;
    commits: Commit[];
    pullRequests: PullRequest[];
    issues: Issue[];
    summary: Summary;
  };
  pagination: Pagination;
}

export interface GridRowData {
  type: 'commit' | 'pullRequest' | 'issue';
  id: string;
  hash?: string;
  number?: number;
  title: string;
  status?: string;
  state?: string;
  author: Author;
  createdAt: string;
  repositoryId: number;
  originalData: Commit | PullRequest | Issue;
}