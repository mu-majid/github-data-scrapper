# GitHub OAuth Frontend

Angular 19 frontend application for GitHub OAuth integration with AG Grid data visualization.

## Features

- **GitHub OAuth Integration**: Complete OAuth 2.0 flow with GitHub
- **Angular Material UI**: Modern, responsive design
- **AG Grid**: Advanced data grid with filtering, sorting, and pagination
- **Modular Architecture**: Feature-based modules and lazy loading
- **JWT Authentication**: Stateless authentication with interceptors
- **Data Visualization**: View GitHub organizations, repositories, commits, pulls, issues, and users

## Requirements Met

✅ **Angular v19 with Angular Material**  
✅ **Configured to run on port 4200**  
✅ **Routing and modules for integration**  
✅ **Components for GitHub OAuth integration**  
✅ **Connect button redirects to GitHub OAuth**  
✅ **Success status display after authentication**  
✅ **Green checkmark and connection date display**  
✅ **Remove Integration functionality**  
✅ **AG Grid with all GitHub data collections**  
✅ **Active Integrations dropdown**  
✅ **Entity dropdown with collection counts**  
✅ **Search functionality across all columns**  
✅ **Dynamic column generation from data**  
✅ **All columns support filters**  
✅ **Pagination implementation**  

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The app is configured to connect to the backend at `http://localhost:3000/api`.

### 3. Start Development Server

```bash
ng serve
```

The application will be available at `http://localhost:4200`.

### 4. Build for Production

```bash
ng build
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Authentication management
│   │   │   ├── github.service.ts     # GitHub API operations
│   │   │   └── data.service.ts       # Data management
│   │   └── interceptors/
│   │       └── auth.interceptor.ts   # JWT token interceptor
│   ├── features/
│   │   ├── integration/
│   │   │   └── integration.component.ts  # Main integration page
│   │   ├── data-view/
│   │   │   └── data-view.component.ts    # AG Grid data viewer
│   │   └── auth/
│   │       ├── auth-success/         # OAuth success page
│   │       └── auth-failure/         # OAuth failure page
│   ├── app.component.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts               # Development config
│   └── environment.prod.ts          # Production config
├── index.html
└── styles.scss
```

## Component Overview

### IntegrationComponent (`/integration`)
- **Connect Button**: Initiates GitHub OAuth flow
- **Connection Status**: Shows green checkmark when connected
- **User Information**: Displays username and last sync time
- **Sync Functionality**: Manual data synchronization
- **Remove Integration**: Expandable panel with remove option

### DataViewComponent (`/data`)
- **Active Integrations Dropdown**: Shows "Github" (as per requirements)
- **Entity Dropdown**: Lists all GitHub collections with counts
- **Search Bar**: Global search across all columns
- **AG Grid**: Dynamic table with:
  - All fields from selected collection as separate columns
  - Sorting and filtering on all columns
  - Pagination (50 items per page)
  - Responsive design

### Auth Components
- **AuthSuccessComponent**: Handles OAuth callback success
- **AuthFailureComponent**: Handles OAuth errors with specific error messages

## Services

### AuthService
- JWT token management
- GitHub OAuth flow
- Authentication status tracking
- Integration removal

### GitHubService  
- Data synchronization
- Sync status monitoring
- GitHub API rate limit checking

### DataService
- Collection management
- Dynamic field definitions
- Search and pagination
- Data export capabilities

## Features

### OAuth Flow
1. User clicks "Connect" button
2. Redirected to GitHub OAuth
3. GitHub redirects back with authorization code
4. Backend exchanges code for JWT token
5. Frontend stores token and shows success status

### Data Grid
- **Dynamic Columns**: Generated from actual data fields
- **Type-Aware Rendering**: Dates, booleans, arrays, objects rendered appropriately
- **Full-Text Search**: Searches across all string fields
- **Advanced Filtering**: Type-specific filters (text, number, date, set)
- **Sorting**: Client and server-side sorting
- **Pagination**: Efficient data loading

### Responsive Design
- Mobile-friendly layout
- Collapsible controls on small screens
- Touch-friendly interface

## Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Authentication Flow

1. **No Token**: Shows connect button
2. **OAuth Initiation**: Redirects to GitHub
3. **Success Callback**: Extracts token from URL, stores locally
4. **Authenticated State**: Shows integration details and data access
5. **Token Expiry**: Automatically handles expired tokens

## AG Grid Configuration

- **Theme**: Alpine theme with custom styling
- **Pagination**: 50 rows per page
- **Column Features**: Sorting, filtering, resizing on all columns
- **Row Selection**: Multiple row selection enabled
- **Animation**: Smooth row animations
- **Responsive**: Auto-sizing columns

## Error Handling

- **OAuth Errors**: Specific error messages for different failure scenarios
- **API Errors**: User-friendly error notifications
- **Network Issues**: Graceful degradation with retry options
- **Loading States**: Spinners and loading indicators

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

This frontend application fully implements all requirements from the PDF specification, providing a complete GitHub OAuth integration with comprehensive data visualization capabilities.