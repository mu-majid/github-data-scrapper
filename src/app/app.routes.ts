import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/integration',
    pathMatch: 'full'
  },
  {
    path: 'integration',
    loadComponent: () => 
      import('./features/integration/integration.component').then(m => m.IntegrationComponent)
  },
  {
    path: 'data',
    loadComponent: () => 
      import('./features/data-view/data-view.component').then(m => m.DataViewComponent)
  },
  {
    path: 'auth/success',
    loadComponent: () => 
      import('./features/auth/auth-success/auth-success.component').then(m => m.AuthSuccessComponent)
  },
  {
    path: 'auth/failure',
    loadComponent: () => 
      import('./features/auth/auth-failure/auth-failure.component').then(m => m.AuthFailureComponent)
  },
  {
    path: '**',
    redirectTo: '/integration'
  }
];