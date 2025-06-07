// src/app/components/data-visualization/data-visualization.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ModuleRegistry,
  AllCommunityModule
} from 'ag-grid-community';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiResponse, GridRowData } from '../../core/models/visual.model';

import { MasterDetailModule, SetFilterModule } from 'ag-grid-enterprise';
import { DataService } from '../../core/services/data.service';

ModuleRegistry.registerModules([MasterDetailModule, AllCommunityModule, SetFilterModule]);

@Component({
  selector: 'app-type-cell',
  template: `
    <span [class]="'badge badge-' + getTypeClass()">
      {{ getTypeLabel() }}
    </span>
  `,
  styles: [`
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-commit { background-color: #e3f2fd; color: #1976d2; }
    .badge-pullRequest { background-color: #f3e5f5; color: #7b1fa2; }
    .badge-issue { background-color: #fff3e0; color: #f57c00; }
  `],
  standalone: true
})
class TypeCellComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  getTypeClass(): string {
    return this.params.data.type;
  }

  getTypeLabel(): string {
    switch (this.params.data.type) {
      case 'commit': return 'Commit';
      case 'pullRequest': return 'Pull Request';
      case 'issue': return 'Issue';
      default: return '';
    }
  }
}

@Component({
  selector: 'app-status-cell',
  template: `
    <span [class]="'status-badge status-' + getStatusClass()" *ngIf="getStatus()">
      {{ getStatus() }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 3px 6px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-open { background-color: #e8f5e8; color: #2e7d32; }
    .status-closed { background-color: #ffebee; color: #c62828; }
    .status-merged { background-color: #f3e5f5; color: #6a1b9a; }
  `],
  standalone: true,
  imports: [CommonModule]
})
class StatusCellComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  getStatus(): string {
    return this.params.data.status || this.params.data.state || '';
  }

  getStatusClass(): string {
    const status = this.getStatus().toLowerCase();
    return status;
  }
}

@Component({
  selector: 'app-author-cell',
  template: `
    <div class="author-cell">
      <img [src]="params.data.author.avatar_url" [alt]="params.data.author.login" class="avatar">
      <span class="author-name">{{ params.data.author.login }}</span>
    </div>
  `,
  styles: [`
    .author-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    .author-name {
      font-weight: 500;
    }
  `],
  standalone: true
})
class AuthorCellComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}

@Component({
  selector: 'app-action-cell',
  template: `
    <button class="btn btn-sm btn-outline-primary" (click)="viewDetails()">
      View Details
    </button>
  `,
  styles: [`
    .btn {
      padding: 4px 8px;
      border: 1px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover {
      background: #007bff;
      color: white;
    }
  `],
  standalone: true
})
class ActionCellComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  viewDetails(): void {
    const data = this.params.data;
    this.params.context.componentParent.viewItemDetails(data.type, data.id, data.originalData);
  }
}

@Component({
  selector: 'app-data-visualization',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular]
})
export class DataVisualizationComponent implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private http = inject(HttpClient);

  repositoryData: ApiResponse['data'] | null = null;
  backednPagination: ApiResponse['pagination'] | null = null;
  rowData: GridRowData[] = [];
  columnDefs: ColDef[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1
  };
  Math = Math;

  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'key', headerName: 'Property', width: 200 },
        { field: 'value', headerName: 'Value', flex: 1 }
      ],
      defaultColDef: {
        sortable: false,
        filter: false
      }
    },
    getDetailRowData: (params: any) => {
      const data = params.data.originalData;
      const detailData = Object.entries(data)
        .filter(([key]) => !['_id', 'repositoryId'].includes(key))
        .map(([key, value]) => ({
          key: key.charAt(0).toUpperCase() + key.slice(1),
          value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
        }));
      params.successCallback(detailData);
    }
  };
  gridContext = { componentParent: this };

  loading = false;
  currentPage = 1;
  pageSize = 25;
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  authorFilter = '';
  repositoryId = '33653601'; // Default repository ID

  private searchSubject = new Subject<string>(); // for debouncing

  showDetailModal = false;
  detailModalTitle = '';
  detailModalContent: any = null;

  private gridApi!: GridApi;


  constructor(private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.setupColumnDefinitions();
    this.setupSearchDebouncing();
    this.loadData();
  }

  private setupColumnDefinitions(): void {
    this.columnDefs = [
      {
        field: 'masterDetail',
        headerName: '',
        width: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          suppressDoubleClickExpand: true,
          innerRenderer: () => '' // No content, just the expand icon
        },
        pinned: 'left',
        lockVisible: true,
        sortable: false,
        filter: false,
        resizable: false
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 130,
        cellRenderer: TypeCellComponent,
        filter: 'agSetColumnFilter',
        flex: 0
      },
      {
        field: 'hash',
        headerName: 'ID/Hash',
        width: 180,
        flex: 0,
        valueGetter: (params) => {
          if (params.data.hash) {
            return params.data.hash.substring(0, 8);
          }
          return params.data.number ? `#${params.data.number}` : '-';
        },
        cellRenderer: (params: ICellRendererParams) => {
          const value = params.value;
          const fullValue = params.data.hash || `#${params.data.number}`;
          return `<span title="${fullValue}" class="monospace">${value}</span>`;
        }
      },
      {
        field: 'title',
        headerName: 'Title/Message',
        flex: 3,
        minWidth: 300,
        cellRenderer: (params: ICellRendererParams) => {
          const title = params.value || '';
          const truncated = title.length > 80 ? title.substring(0, 80) + '...' : title;
          return `<div title="${title}" class="title-cell">${truncated}</div>`;
        },
        cellStyle: { // Add cell styling
          'white-space': 'nowrap',
          'overflow': 'hidden',
          'text-overflow': 'ellipsis'
        }
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        flex: 0,
        cellRenderer: StatusCellComponent,
        valueGetter: (params) => params.data.status || params.data.state || ''
      },
      {
        field: 'author',
        headerName: 'Author',
        width: 160,
        flex: 0,
        cellRenderer: AuthorCellComponent,
        valueGetter: (params) => params.data.author.login
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 120,
        flex: 0,
        valueFormatter: (params) => {
          const date = new Date(params.value);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          });
        }
      },
      {
        headerName: 'Actions',
        width: 110,
        flex: 0,
        cellRenderer: ActionCellComponent,
        sortable: false,
        filter: false,
        resizable: false
      }
    ];
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  private performSearch(term: string): void {
    this.currentPage = 1;
    this.loadData();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadData();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    // Auto-size columns to fit content
    this.gridApi.autoSizeAllColumns();
    // Ensure grid fills container
    this.gridApi.sizeColumnsToFit();
  }

  onPaginationChanged(): void {
    if (this.gridApi) {
      this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    }
  }

  loadData(repositoryId?: string): void {
    this.loading = true;

    const repoId = repositoryId || this.repositoryId;
    const params: any = {
      repositoryId: repoId,
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    if (this.statusFilter) {
      params.status = this.statusFilter;
    }
    if (this.authorFilter && this.authorFilter.trim()) {
      params.author = this.authorFilter.trim();
    }
    console.log('Loading data with params:', params);
    this.dataService.visualiseRepo(params)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.repositoryData = response.data;
            this.backednPagination = response.pagination
            this.transformDataForGrid();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.loading = false;
        }
      });
  }

  private transformDataForGrid(): void {
    if (!this.repositoryData) return;

    const transformedData: GridRowData[] = [];
    this.repositoryData.commits.forEach(commit => {
      transformedData.push({
        type: 'commit',
        id: commit._id,
        hash: commit.hash,
        title: commit.message,
        author: commit.author,
        createdAt: commit.createdAt,
        repositoryId: commit.repositoryId,
        originalData: commit
      });
    });
    this.repositoryData.pullRequests.forEach(pr => {
      transformedData.push({
        type: 'pullRequest',
        id: pr._id,
        number: pr.number,
        title: pr.title,
        status: pr.status,
        author: pr.author,
        createdAt: pr.createdAt,
        repositoryId: pr.repositoryId,
        originalData: pr
      });
    });
    this.repositoryData.issues.forEach(issue => {
      transformedData.push({
        type: 'issue',
        id: issue._id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.author,
        createdAt: issue.createdAt,
        repositoryId: issue.repositoryId,
        originalData: issue
      });
    });
    transformedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.rowData = transformedData;
    console.log('Transformed Data : ', this.rowData)
  }

  getCurrentPageStart(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  getCurrentPageEnd(): number {
    const start = this.getCurrentPageStart();
    const totalItems = this.getTotalItems();
    return Math.min(start + this.pageSize - 1, totalItems);
  }

  getTotalItems(): number {
    if (this.backednPagination) {
      return this.backednPagination.totalCommits +
        this.backednPagination.totalPullRequests +
        this.backednPagination.totalIssues;
    }
    // Fallback to rowData length when pagination isn't available yet
    return this.rowData.length;
  }

  getTotalPages(): number {
    const totalItems = this.getTotalItems();
    if (totalItems === 0) return 1;
    return Math.ceil(totalItems / this.pageSize);
  }

  hasNextPage(): boolean {
    if (this.backednPagination?.hasNextPage) {
      const hasNext = this.backednPagination?.hasNextPage;
      return hasNext.commits || hasNext.pullRequests || hasNext.issues;
    }
    return this.currentPage < this.getTotalPages();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      // Reload data for the new page
      this.loadData();
    }
  }

  onRepositoryIdChange(): void {
    this.currentPage = 1;
    this.loadData(this.repositoryId);
  }

  viewItemDetails(type: string, id: string, data: any): void {
    console.log(`Viewing ${type} details:`, data);
    this.http.get(`/api/dummy/${type}s/${id}`).subscribe({
      next: (response) => {
        console.log(`Dummy ${type} response:`, response);
      },
      error: (error) => {
        console.log(`Dummy ${type} endpoint call (expected to fail):`, error);
      }
    });
    this.detailModalTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Details`;
    this.detailModalContent = data;
    this.showDetailModal = true;
  }

  getRowId = (params: any) => {
    return params.data.id;
  };

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.detailModalContent = null;
  }

  refreshData(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.statusFilter = '';
    this.authorFilter = '';
    this.currentPage = 1;
    this.loadData();
  }
}