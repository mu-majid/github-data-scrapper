import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { DataService, Collection, FieldDefinition, CollectionDataResponse } from '../../core/services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    AgGridAngular,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss']
})
export class DataViewComponent implements OnInit {
  public themeClass: string = 'ag-theme-quartz';
  collections: Collection[] = [];
  selectedIntegration = 'Github';
  selectedEntity = '';
  searchTerm = '';

  rowSelection = {
    mode: 'multiRow' as const,
    checkboxes: false,
    enableClickSelection: true
  };

  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 0, // Don't auto-resize by default
    // suppressMenu: false,
    floatingFilter: false, // You can enable this for better filtering
    // Add these for better UX
    suppressMovable: false, // Allow column reordering
    lockPosition: false
  };

  isLoading = false;
  private gridApi!: GridApi;

  public currentPage = 1;
  public pageSize = 50;
  public totalRows = 0;
  public totalPages = 0;
  public pageSizeOptions = [25, 50, 100, 200];

  hasSearchResults: boolean = false;
  customFilters: any = {};
  dateRange = { start: '', end: '' };
  selectedCollection: string = '';
  availableFacets = [
    { key: 'user', name: 'User', selectedValues: [] as string[] },
    { key: 'repo', name: 'Repository', selectedValues: [] as string[] },
    { key: 'status', name: 'Status', selectedValues: [] as string[] }
  ];
  filtersExpanded: boolean = false;

  private currentSearch = '';
  private currentSort = { field: 'createdAt', direction: 'desc' };
  Math = Math;
  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCollections();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();

    // If we have a selected entity, load data
    if (this.selectedEntity) {
      this.loadCollectionData();
    }
  }

  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  findUser(): void {
    if (!this.searchTerm.trim()) return;

    // Extract potential ticket ID from search query
    const ticketId = this.extractTicketId(this.searchTerm);
    console.log('ticketId ', ticketId)
    this.dataService.findUserByTicket(ticketId).subscribe({
      next: (response) => {
        if (response.success && response.userData.length > 0) {
          this.openFindUserGrid(response.userData);
        } else {
          this.snackBar.open('No user data found for this ticket', 'Close', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Find user error:', error);
        this.snackBar.open('Error finding user data', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private extractTicketId(searchQuery: string): string {
    // Try to extract number from search query
    const numberMatch = searchQuery.match(/\b\d+\b/);
    if (numberMatch) {
      return numberMatch[0];
    }
    // If no number found, use the whole search query
    return searchQuery.trim();
  }

  private openFindUserGrid(userData: any[]): void {
    // Store data in sessionStorage for the new window
    sessionStorage.setItem('findUserData', JSON.stringify(userData));

    // Open new tab with Find User Grid
    const newWindow = window.open('/find-user-grid', '_blank', 'width=1400,height=800');
    if (!newWindow) {
      this.snackBar.open('Please allow popups to view Find User results', 'Close', {
        duration: 3000
      });
    }
  }

  // Open Global Search - you can implement this as a simple route navigation
  openGlobalSearch(): void {
    // Store current search term for the global search
    sessionStorage.setItem('globalSearchQuery', this.searchTerm);

    // Open in new tab
    const newWindow = window.open('/global-search', '_blank', 'width=1400,height=900');
    if (!newWindow) {
      this.snackBar.open('Please allow popups to view Global Search', 'Close', {
        duration: 3000
      });
    }
  }

  onEntityChange(): void {
    if (this.selectedEntity) {
      this.selectedCollection = this.selectedEntity;
      this.currentPage = 1;
      this.hasSearchResults = false;
      this.searchTerm = '';
      this.loadCollectionData();
    }
  }

  clearAllFilters(): void {
    this.customFilters = {};
    this.dateRange = { start: '', end: '' };
    this.availableFacets.forEach(facet => facet.selectedValues = []);
    this.searchTerm = '';
    this.hasSearchResults = false;
    this.currentPage = 1;
    this.loadCollectionData();
  }

  applyFilters(): void {
    if (!this.selectedEntity) return;

    const filterOptions = {
      filters: this.customFilters,
      dateRange: this.dateRange.start && this.dateRange.end ? this.dateRange : null,
      search: this.searchTerm,
      page: 1,
      limit: this.pageSize
    };

    this.dataService.advancedFilter(this.selectedEntity, filterOptions)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.rowData = response.data;
            this.totalRows = response.pagination.totalRecords;
            this.totalPages = response.pagination.total;
            this.currentPage = 1;

            if (this.gridApi) {
              this.gridApi.setGridOption('rowData', this.rowData);
            }

            this.snackBar.open('Filters applied successfully', 'Close', {
              duration: 2000
            });
          }
        },
        error: (error) => {
          console.error('Filter error:', error);
          this.snackBar.open('Error applying filters', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  addFacetFilter(facetKey: string, value: string): void {
    if (!value.trim()) return;

    const facet = this.availableFacets.find(f => f.key === facetKey);
    if (facet && !facet.selectedValues.includes(value)) {
      facet.selectedValues.push(value);
      this.applyFilters();
    }
  }

  removeFacetFilter(facetKey: string, value: string): void {
    const facet = this.availableFacets.find(f => f.key === facetKey);
    if (facet) {
      facet.selectedValues = facet.selectedValues.filter(v => v !== value);
      this.applyFilters();
    }
  }


  onSearch(): void {
    if (this.selectedEntity) {
      this.currentSearch = this.searchTerm;
      this.currentPage = 1;
      this.hasSearchResults = this.searchTerm.trim().length > 0;
      this.selectedCollection = this.selectedEntity; // Keep them in sync
      this.loadCollectionData();
    }
  }

  onSortChanged(): void {
    // Note: With Community edition, we'll handle sorting on the client side
    // The data is already loaded and AG Grid will sort it
  }

  onFilterChanged(): void {
    // Filters work client-side with the loaded data
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCollectionData();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadCollectionData();
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  onFirstPage(): void {
    this.onPageChange(1);
  }

  onLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  private loadCollections(): void {
    this.dataService.getCollections().subscribe({
      next: (response) => {
        if (response.success) {
          this.collections = response.collections;
          // Auto-select the first collection with data
          const firstWithData = this.collections.find(c => c.count > 0);
          if (firstWithData) {
            this.selectedEntity = firstWithData.name;
            if (this.gridApi) { // ready?
              this.loadCollectionData();
            }
          }
        }
      },
      error: (error) => {
        console.error('Failed to load collections:', error);
        this.snackBar.open('Failed to load collections', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private fetchData(): void {
    this.isLoading = true;

    this.dataService.getCollectionData(this.selectedEntity, {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.currentSearch,
      sortBy: this.currentSort.field,
      sortOrder: this.currentSort.direction as any
    }).subscribe({
      next: (response: CollectionDataResponse) => {
        this.isLoading = false;

        if (response.success && response.data && response.data.length > 0) {
          this.totalRows = response.pagination.total;
          this.totalPages = response.pagination.pages;
          this.rowData = response.flattenedData;
          this.createColumnDefsFromData();
          this.updateGridWithData();

          console.log(`Loaded ${this.rowData.length} rows with ${this.columnDefs.length} columns`);
        } else {
          console.error('No data received from server');
          this.clearGrid();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching data:', error);
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
      }
    });
  }

  // Create column definitions from actual data - shows ALL columns
  private createColumnDefsFromData(): void {
    if (!this.rowData || this.rowData.length === 0) {
      this.columnDefs = [];
      return;
    }
    const firstRow = this.rowData[0];
    const excludeFields = ['userId', '__v', '_id']; // Internal fields to hide
    const allKeys = Object.keys(firstRow).filter(key => !excludeFields.includes(key));
    this.columnDefs = allKeys.map(key => {
      const colDef: ColDef = {
        field: key,
        headerName: this.formatHeaderName(key),
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: this.getColumnWidth(key, firstRow[key])
      };

      this.addCellRenderer(colDef, key, firstRow[key]);

      return colDef;
    });

    console.log(`Created ${this.columnDefs.length} column definitions:`, this.columnDefs.map(c => c.field));
  }

  private formatHeaderName(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim();
  }

  private getColumnWidth(key: string, sampleValue: any): number {
    if (key.includes('url') || key.includes('_url') || key.includes('html_url')) {
      return 200;
    }

    if (key.includes('date') || key.includes('_at') || key.includes('created') || key.includes('updated')) {
      return 180;
    }
    if (key === 'id' || key.includes('_id')) {
      return 100;
    }
    if (key.includes('name') || key.includes('title') || key.includes('login')) {
      return 150;
    }
    if (key.includes('description') || key.includes('bio')) {
      return 250;
    }
    if (typeof sampleValue === 'number') {
      return 120;
    }
    if (typeof sampleValue === 'boolean') {
      return 80;
    }
    return 140;
  }

  private addCellRenderer(colDef: ColDef, key: string, sampleValue: any): void {
    if (key.includes('url') || key.includes('_url') || key.includes('html_url')) {
      colDef.cellRenderer = (params: any) => {
        if (!params.value) return '';
        return `<a href="${params.value}" target="_blank" style="color: #2196f3; text-decoration: none;">${params.value}</a>`;
      };
      return;
    }

    if (key.includes('date') || key.includes('_at') || key.includes('created') || key.includes('updated')) {
      colDef.cellRenderer = (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return params.value; // Invalid, show as-is
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      };
      return;
    }

    if (typeof sampleValue === 'boolean') {
      colDef.cellRenderer = (params: any) => {
        if (params.value === null || params.value === undefined) return '';
        return params.value ? '✅' : '❌';
      };
      return;
    }

    if (typeof sampleValue === 'number') {
      colDef.cellRenderer = (params: any) => {
        if (params.value === null || params.value === undefined) return '';
        if (key === 'id' || key.includes('_id')) {
          return String(params.value);
        }
        return Number(params.value).toLocaleString();
      };
      return;
    }

    if (Array.isArray(sampleValue)) {
      colDef.cellRenderer = (params: any) => {
        if (!params.value || !Array.isArray(params.value)) return '';
        return `[${params.value.length} items]`;
      };
      return;
    }

    if (sampleValue && typeof sampleValue === 'object') {
      colDef.cellRenderer = (params: any) => {
        if (!params.value || typeof params.value !== 'object') return '';
        return '{...}';
      };
      return;
    }

    if (key.includes('email')) {
      colDef.cellRenderer = (params: any) => {
        if (!params.value) return '';
        return `<a href="mailto:${params.value}" style="color: #2196f3;">${params.value}</a>`;
      };
      return;
    }
  }

  private updateGridWithData(): void {
    if (!this.gridApi) {
      console.error('Grid API not available');
      return;
    }

    // Clear previous state
    this.gridApi.setGridOption('rowData', []);
    this.gridApi.setGridOption('columnDefs', []);

    // Set new data with proper timing
    setTimeout(() => {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);

      setTimeout(() => {
        this.gridApi.setGridOption('rowData', this.rowData);

        setTimeout(() => {
          this.gridApi.sizeColumnsToFit();
        }, 100);
      }, 50);
    }, 50);
  }

  private clearGrid(): void {
    this.rowData = [];
    this.columnDefs = [];
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', []);
      this.gridApi.setGridOption('columnDefs', []);
    }
  }

  private loadCollectionData(): void {
    if (!this.selectedEntity) return;

    console.log('Loading data for collection:', this.selectedEntity);

    // Go directly to data fetching - no need for field definitions anymore
    this.fetchData();
  }

  private setupColumnDefs(fields: FieldDefinition[]): void {
    this.columnDefs = fields.map(field => {
      const colDef: ColDef = {
        field: field.field,
        headerName: field.headerName,
        sortable: field.sortable,
        filter: this.getFilterType(field.type),
        resizable: field.resizable,
        width: field.width,
        minWidth: 150
      };

      // Add custom cell renderers based on field type
      switch (field.type) {
        case 'date':
          colDef.cellRenderer = (params: any) => {
            if (!params.value) return '';
            const date = new Date(params.value);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          };
          break;

        case 'boolean':
          colDef.cellRenderer = (params: any) => {
            return params.value ? '✓' : '✗';
          };
          break;

        case 'array':
          colDef.cellRenderer = (params: any) => {
            if (!params.value || !Array.isArray(params.value)) return '';
            return `[${params.value.length} items]`;
          };
          break;

        case 'object':
          colDef.cellRenderer = (params: any) => {
            if (!params.value || typeof params.value !== 'object') return '';
            return '{...}';
          };
          break;

        case 'number':
          if (field.field.toLowerCase().includes('id') ||
            field.field === 'id' ||
            field.headerName.toLowerCase().includes('id')) {
            colDef.cellRenderer = (params: any) => {
              if (params.value === null || params.value === undefined) return '';
              return String(params.value);
            };
          } else {
            colDef.cellRenderer = (params: any) => {
              if (params.value === null || params.value === undefined) return '';
              return Number(params.value).toLocaleString();
            };
          }
          break;
      }

      return colDef;
    });
  }

  private getFilterType(fieldType: string): string | boolean {
    switch (fieldType) {
      case 'number':
        return 'agNumberColumnFilter';
      case 'date':
        return 'agDateColumnFilter';
      case 'boolean':
        return 'agTextColumnFilter';
      default:
        return 'agTextColumnFilter';
    }
  }

  // Add these utility methods for column management
  autoSizeColumns(): void {
    if (this.gridApi) {
      this.gridApi.autoSizeAllColumns();
    }
  }

  resetColumns(): void {
    if (this.gridApi) {
      this.gridApi.resetColumnState();
      this.gridApi.sizeColumnsToFit();
    }
  }
}