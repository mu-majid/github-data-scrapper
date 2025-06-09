import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CollectionsResponse, SearchParams, CollectionDataResponse, FieldsResponse, VisualisationSearchParams } from '../models/data.model';
import { ApiResponse } from '../models/visual.model';

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
    if (params.activeFilterId) httpParams = httpParams.set('activeFilterId', params.activeFilterId);
    if (params.facetQuery) httpParams = httpParams.set('facetQuery', params.facetQuery);
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

  getFacetValues(collection: string, field: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/facets/${collection}/field/${field}`);
  }

  getCollectionFacets(collection: string, fields: string[]): Observable<any> {
    const params = new HttpParams().set('fields', fields.join(','));
    return this.http.get<any>(`${this.baseUrl}/facets/${collection}`, { params });
  }

  facetedSearch(collection: string, facets: any, page: number = 1, limit: number = 50): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/data/${collection}/faceted-search`, {
      facets,
      page,
      limit
    });
  }

  visualiseRepo(params: VisualisationSearchParams = {}): Observable<ApiResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.repositoryId) httpParams = httpParams.set('repositoryId', params.repositoryId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.author) httpParams = httpParams.set('author', params.author);
    console.log('httpParams -> ',httpParams)
    return this.http.get<ApiResponse>(
      `${this.baseUrl}/visualisation/repository`,
      { params: httpParams }
    );
  }

}