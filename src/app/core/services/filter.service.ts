import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Filter } from '../models/filter.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private apiUrl = `${environment.apiUrl}/filters`;
  private activeFiltersSubject = new BehaviorSubject<Filter[]>([]);
  public activeFilters$ = this.activeFiltersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserFilters(): Observable<Filter[]> {
    return this.http.get<Filter[]>(this.apiUrl);
  }

  getFilter(id: string): Observable<Filter> {
    return this.http.get<Filter>(`${this.apiUrl}/${id}`);
  }

  createFilter(filter: Filter): Observable<Filter> {
    return this.http.post<Filter>(this.apiUrl, filter);
  }

  updateFilter(id: string, filter: Filter): Observable<Filter> {
    return this.http.put<Filter>(`${this.apiUrl}/${id}`, filter);
  }

  deleteFilter(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleFilter(id: string): Observable<Filter> {
    return this.http.patch<Filter>(`${this.apiUrl}/${id}/toggle`, {});
  }

  getActiveFiltersForCollection(collection: string): Observable<Filter[]> {
    return this.http.get<Filter[]>(`${this.apiUrl}/collection/${collection}`);
  }

  setActiveFilters(filters: Filter[]): void {
    this.activeFiltersSubject.next(filters);
  }
}