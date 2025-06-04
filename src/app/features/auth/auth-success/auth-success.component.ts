import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-success',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './auth-success.component.html',
  styleUrls: ['./auth-success.component.scss']
})
export class AuthSuccessComponent implements OnInit {
  isProcessing = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.authService.setToken(token);
        // Give a moment for the auth status to update
        setTimeout(() => {
          this.authService.checkAuthStatus().subscribe({
            next: () => {
              this.isProcessing = false;
            },
            error: (error) => {
              console.error('Auth status check failed:', error);
              // continue as token is saved
              this.isProcessing = false;
            }
          });
        }, 1000);
      } else {
        this.router.navigate(['/auth/failure'], {
          queryParams: { error: 'no_token' }
        });
      }
    });
  }

  goToIntegration(): void {
    this.router.navigate(['/integration']);
  }
}