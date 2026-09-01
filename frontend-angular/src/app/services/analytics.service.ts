import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrackEventDto } from '../store/models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/analytics/event';

  trackEvent(event: TrackEventDto): void {
    this.http.post(this.apiUrl, event).subscribe({
      error: (err: unknown) => console.error('Error sending analytics:', err),
    });
  }
}
