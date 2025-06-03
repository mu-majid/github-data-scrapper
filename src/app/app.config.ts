import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise'; 

ModuleRegistry.registerModules([AllCommunityModule, SetFilterModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
