import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly apiUrl = 'http://localhost:3001/characters/search';

  constructor(private http: HttpClient) {}

  search(query: string, page: number = 1, limit: number = 30): Observable<SearchResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<SearchResponse>(this.apiUrl, { params });
  }
}
