// find-user-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
    
ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-find-user-grid',
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
  templateUrl: './find-user-grid.component.html',
  styleUrls: ['./find-user-grid.component.scss']
})
export class FindUserGridComponent implements OnInit {
  rowData: any[] = [];
  searchedTicket: string = '';
  
  columnDefs: ColDef[] = [
    { 
      headerName: 'Ticket ID', 
      field: 'ticketId', 
      filter: true, 
      sortable: true,
      pinned: 'left',
      width: 120 
    },
    { 
      headerName: 'User', 
      field: 'user', 
      filter: true, 
      sortable: true,
      width: 150 
    },
    { 
      headerName: 'User Name', 
      field: 'userName', 
      filter: true, 
      sortable: true,
      width: 150 
    },
    { 
      headerName: 'Date', 
      field: 'date', 
      filter: 'agDateColumnFilter', 
      sortable: true,
      width: 180,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString();
      }
    },
    { 
      headerName: 'Summary', 
      field: 'summary', 
      filter: true, 
      sortable: true,
      flex: 1,
      minWidth: 200
    },
    { 
      headerName: 'Description', 
      field: 'description', 
      filter: true, 
      sortable: true,
      flex: 1,
      minWidth: 200
    },
    { 
      headerName: 'Collection', 
      field: 'collection', 
      filter: true, 
      sortable: true,
      width: 120
    }
  ];
  
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  ngOnInit() {
    this.loadUserData();
    this.listenForMessages();
  }

  private loadUserData() {
    const userData = sessionStorage.getItem('findUserData');
    const ticketId = sessionStorage.getItem('findUserTicket');
    
    if (userData) {
      this.rowData = JSON.parse(userData);
      this.searchedTicket = ticketId || 'Unknown';
      sessionStorage.removeItem('findUserData');
      sessionStorage.removeItem('findUserTicket');
    }
  }

  private listenForMessages() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'FIND_USER_DATA') {
        this.rowData = event.data.userData;
        this.searchedTicket = event.data.ticketId;
      }
    });
  }

  closeWindow() {
    window.close();
  }
}