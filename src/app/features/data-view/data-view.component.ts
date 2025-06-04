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
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { DataService, Collection, FieldDefinition, CollectionDataResponse } from '../../core/services/data.service';

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
    AgGridAngular
  ],
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss']
})
export class DataViewComponent implements OnInit {
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
    minWidth: 100
  };

  isLoading = false;
  private gridApi!: GridApi;
  
  // Pagination properties
  public currentPage = 1;
  public pageSize = 50;
  public totalRows = 0;
  public totalPages = 0;
  public pageSizeOptions = [25, 50, 100, 200];

  private currentSearch = '';
  private currentSort = { field: 'createdAt', direction: 'desc' };
  Math = Math;
  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar
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

  onEntityChange(): void {
    if (this.selectedEntity) {
      this.currentPage = 1;
      this.loadCollectionData();
    }
  }

  onSearch(): void {
    if (this.selectedEntity) {
      this.currentSearch = this.searchTerm;
      this.currentPage = 1;
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

  private loadCollectionData(): void {
    if (!this.selectedEntity) return;

    // First load field definitions
    this.dataService.getCollectionFields(this.selectedEntity).subscribe({
      next: (fieldsResponse) => {
        if (fieldsResponse.success && fieldsResponse.fields.length > 0) {
          this.setupColumnDefs(fieldsResponse.fields);
          this.fetchData();
        }
      },
      error: (error) => {
        console.error('Failed to load field definitions:', error);
        this.snackBar.open('Failed to load field definitions', 'Close', {
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
        
        if (response.success) {
          console.log('Server response:', response);          
          this.totalRows = response.pagination.total;
          this.totalPages = response.pagination.pages;
          this.rowData = response.data;
          
          if (this.gridApi) { // ready ?
            this.gridApi.setGridOption('rowData', this.rowData);
          }
          console.log(`Loaded page ${this.currentPage} of ${this.totalPages}, showing ${response.data.length} rows of ${this.totalRows} total`);
        } 
        else {
          this.snackBar.open('Failed to load data', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load collection data:', error);
        this.snackBar.open('Failed to load data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
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
}