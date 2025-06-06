import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { DataService } from '../../core/services/data.service';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
    
ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './/global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  isLoading: boolean = false;
  selectedCollections: string[] = [];
  availableCollections = [
    { key: 'organizations', name: 'Organizations' },
    { key: 'repositories', name: 'Repositories' },
    { key: 'commits', name: 'Commits' },
    { key: 'pulls', name: 'Pull Requests' },
    { key: 'issues', name: 'Issues' },
    { key: 'users', name: 'Users' }
  ];

  // AG Grid configuration
  columnDefs: any[] = [];
  rowData: any[] = [];
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100
  };

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    // Select all collections by default
    this.selectedCollections = this.availableCollections.map(c => c.key);
  }

  ngOnInit() {
    this.loadInitialQuery();
    this.listenForMessages();
  }

  private loadInitialQuery() {
    // Method 1: Load from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['query']) {
        this.searchQuery = params['query'];
        this.performGlobalSearch();
      }
    });

    // Method 2: Load from sessionStorage
    const storedQuery = sessionStorage.getItem('globalSearchQuery');
    if (storedQuery && !this.searchQuery) {
      this.searchQuery = storedQuery;
      sessionStorage.removeItem('globalSearchQuery');
      this.performGlobalSearch();
    }
  }

  private listenForMessages() {
    // Method 3: Listen for postMessage
    window.addEventListener('message', (event) => {
      if (event.data.type === 'GLOBAL_SEARCH_QUERY') {
        this.searchQuery = event.data.query;
        this.performGlobalSearch();
      }
    });
  }

  toggleCollection(collectionKey: string, checked: boolean) {
    if (checked) {
      if (!this.selectedCollections.includes(collectionKey)) {
        this.selectedCollections.push(collectionKey);
      }
    } else {
      this.selectedCollections = this.selectedCollections.filter(key => key !== collectionKey);
    }
    
    if (this.searchQuery) {
      this.performGlobalSearch();
    }
  }

  performGlobalSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    if (this.selectedCollections.length === 0) {
      alert('Please select at least one collection to search');
      return;
    }

    this.isLoading = true;
    const collections = this.selectedCollections.join(',');

    this.dataService.globalSearch(this.searchQuery, 1, 100, collections)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.searchResults = response.results;
            this.prepareGridData();
          } else {
            console.error('Search failed:', response.error);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Global search error:', error);
          // Show mock data for now if service fails
          this.showMockData();
        }
      });
  }

  private showMockData() {
    // Mock data for testing
    this.searchResults = [
      { collection: 'organizations', count: 2, data: [] },
      { collection: 'commits', count: 5, data: [] }
    ];
    this.rowData = [
      { _source: 'Organizations', name: 'Test Org', login: 'test-org' },
      { _source: 'Commits', message: 'Test commit', author: 'Test Author' }
    ];
    this.generateColumnDefs();
  }

  private prepareGridData() {
    // Combine all results into a single grid with collection indicator
    this.rowData = [];
    
    this.searchResults.forEach(result => {
      if (result.data && result.data.length > 0) {
        const dataWithCollection = result.data.map((item: any) => ({
          ...item,
          _collection: result.collection,
          _source: result.collection.charAt(0).toUpperCase() + result.collection.slice(1)
        }));
        this.rowData.push(...dataWithCollection);
      }
    });

    // Generate column definitions from the data
    if (this.rowData.length > 0) {
      this.generateColumnDefs();
    }
  }

  private generateColumnDefs() {
    const sampleItem = this.rowData[0];
    const columns: any[] = [];

    // Add collection column first
    columns.push({
      headerName: 'Source',
      field: '_source',
      filter: true,
      sortable: true,
      pinned: 'left',
      width: 120,
      cellStyle: { fontWeight: 'bold' }
    });

    // Add other columns, excluding internal fields
    Object.keys(sampleItem).forEach(key => {
      if (!key.startsWith('_')) {
        columns.push({
          headerName: this.formatHeaderName(key),
          field: key,
          filter: true,
          sortable: true,
          resizable: true,
          minWidth: 120
        });
      }
    });

    this.columnDefs = columns;
  }

  private formatHeaderName(key: string): string {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  closeWindow() {
    window.close();
  }
}