import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrackEventDto } from '../store/models/analytics.model';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/analytics/event`;

  trackEvent(event: TrackEventDto): void {
    this.http.post(this.apiUrl, event).subscribe({
      error: (err: unknown) => console.error('Error sending analytics:', err),
    });
  }
}
