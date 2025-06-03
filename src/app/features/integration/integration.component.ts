import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService, GitHubIntegration } from '../../core/services/auth.service';
import { GitHubService } from '../../core/services/github.service';

@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    RouterModule
  ],
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit {
  isAuthenticated = false;
  integration: GitHubIntegration | null = null;
  syncStatus: any = null;
  
  isConnecting = false;
  isSyncing = false;
  isRemoving = false;

  constructor(
    private authService: AuthService,
    private githubService: GitHubService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    
    // Subscribe to auth status changes
    this.authService.authStatus$.subscribe(status => {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.integration = this.authService.getIntegration();
      
      console.log('isAuthenticated:', this.isAuthenticated);
      console.log('integration:', this.integration);
      
      if (this.isAuthenticated) {
        this.loadSyncStatus();
      }
    });

    // Check current authentication state immediately
    const currentToken = this.authService.getToken();
    if (currentToken) {
      console.log('Token found on component init, checking status...');
      this.authService.checkAuthStatus().subscribe();
    }
  }

  connectToGitHub(): void {
    this.isConnecting = true;
    this.authService.redirectToGitHub();
  }

  syncData(): void {
    this.isSyncing = true;
    this.githubService.syncGitHubData().subscribe({
      next: (response) => {
        this.isSyncing = false;
        if (response.success) {
          this.snackBar.open('GitHub data synced successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.loadSyncStatus();
        } else {
          this.snackBar.open('Sync failed: ' + response.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.isSyncing = false;
        console.error('Sync error:', error);
        this.snackBar.open('Sync failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeIntegration(): void {
    if (confirm('Are you sure you want to remove this integration? This will delete all synced data.')) {
      this.isRemoving = true;
      this.authService.removeIntegration().subscribe({
        next: () => {
          this.isRemoving = false;
          this.snackBar.open('Integration removed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Auth service will automatically update status
        },
        error: (error) => {
          this.isRemoving = false;
          console.error('Remove integration error:', error);
          this.snackBar.open('Failed to remove integration', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private loadSyncStatus(): void {
    this.githubService.getSyncStatus().subscribe({
      next: (status) => {
        this.syncStatus = status;
      },
      error: (error) => {
        console.error('Failed to load sync status:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // testing 
  syncJupyterData(): void {
    this.isSyncing = true;
    // Use Jupyter-specific sync for testing
    this.githubService.syncJupyterTestData().subscribe({
      next: (response) => {
        this.isSyncing = false;
        if (response.success) {
          this.snackBar.open('Jupyter test data synced successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.loadSyncStatus();
        } else {
          this.snackBar.open('J-Sync failed: ' + response.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.isSyncing = false;
        console.error('J-Sync error:', error);
        this.snackBar.open('Sync failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

}