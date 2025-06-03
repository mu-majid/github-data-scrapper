import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-failure',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './auth-failure.component.html',
  styleUrls: ['./auth-failure.component.scss']
})
export class AuthFailureComponent implements OnInit {
  errorCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.errorCode = params['error'] || 'unknown';
    });
  }

  getErrorMessage(): string {
    switch (this.errorCode) {
      case 'no_code':
        return 'No authorization code was received from GitHub.';
      case 'invalid_state':
        return 'Invalid state parameter. This might be a security issue.';
      case 'state_expired':
        return 'Authentication session expired. Please try again.';
      case 'no_access_token':
        return 'Failed to obtain access token from GitHub.';
      case 'callback_error':
        return 'An error occurred during the authentication process.';
      case 'no_token':
        return 'No authentication token was provided.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  }

  tryAgain(): void {
    this.router.navigate(['/integration']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}