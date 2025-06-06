import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Collection {
  name: string;
  label: string;
  count: number;
}

export interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
}

export interface FieldDefinition {
  field: string;
  headerName: string;
  type: string;
  sortable: boolean;
  filter: boolean;
  resizable: boolean;
  width: number;
  cellRenderer?: string;
}

export interface FieldsResponse {
  success: boolean;
  fields: FieldDefinition[];
  message?: string;
}

export interface CollectionDataResponse {
  success: boolean;
  data: any[];
  flattenedData: any[]
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fields: string[];
  search: string;
  sortBy: string;
  sortOrder: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCollections(): Observable<CollectionsResponse> {
    return this.http.get<CollectionsResponse>(`${this.baseUrl}/data/collections`);
  }

  getCollectionData(collectionName: string, params: SearchParams = {}): Observable<CollectionDataResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<CollectionDataResponse>(
      `${this.baseUrl}/data/collection/${collectionName}`,
      { params: httpParams }
    );
  }

  getCollectionFields(collectionName: string): Observable<FieldsResponse> {
    return this.http.get<FieldsResponse>(`${this.baseUrl}/data/collection/${collectionName}/fields`);
  }

  // Add to your existing data.service.ts
  globalSearch(query: string, page: number = 1, limit: number = 50, collections?: string): Observable<any> {
    const params: any = { query, page: page.toString(), limit: limit.toString() };
    if (collections) {
      params.collections = collections;
    }
    return this.http.get(`${this.baseUrl}/search/global`, { params });
  }

  findUserByTicket(ticketId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/find/${ticketId}`);
  }

  advancedFilter(collectionName: string, filterOptions: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/search/collection/${collectionName}/filter`, filterOptions);
  }

  smartSearch(query: string, collection: string, page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/smart`, {
      params: { query, collection, page: page.toString(), limit: limit.toString() }
    });
  }
}