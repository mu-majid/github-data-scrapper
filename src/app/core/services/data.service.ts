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

  constructor(private http: HttpClient) {}

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

  exportCollectionData(collectionName: string, format: 'json' | 'csv' = 'json'): Observable<any> {
    let httpParams = new HttpParams().set('format', format);
    
    if (format === 'csv') {
      return this.http.get(`${this.baseUrl}/data/collection/${collectionName}/export`, {
        params: httpParams,
        responseType: 'blob'
      });
    } 
    else {
      return this.http.get(`${this.baseUrl}/data/collection/${collectionName}/export`, {
        params: httpParams,
        responseType: 'json'
      });
    }
  }

  getCollectionStats(collectionName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/data/collection/${collectionName}/stats`);
  }

  searchAllCollections(query: string, limit: number = 10): Observable<any> {
    let httpParams = new HttpParams()
      .set('query', query)
      .set('limit', limit.toString());

    return this.http.get(`${this.baseUrl}/data/search`, { params: httpParams });
  }

  deleteRecord(collectionName: string, recordId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/data/collection/${collectionName}/record/${recordId}`);
  }

  clearCollection(collectionName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/data/collection/${collectionName}/clear`);
  }
}