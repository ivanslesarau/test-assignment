import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { SearchActions } from '../actions/search.actions';
import { PolygonActions } from '../actions/polygon.actions';
import { AnalyticsService } from '../../services/analytics.service';
import { TrackEventDto } from '../models/analytics.model';

@Injectable()
export class AnalyticsEffects {
  private actions$ = inject(Actions);
  private analyticsService = inject(AnalyticsService);

  trackSearch$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SearchActions.searchRequest),
        tap(({ query }) => {
          if (query.trim().length > 0) {
            const event: TrackEventDto = {
              eventType: 'SEARCH',
              payload: { query },
            };
            this.analyticsService.trackEvent(event);
          }
        }),
      ),
    { dispatch: false },
  );

  trackPolygon$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PolygonActions.savePolygon),
        tap(({ characterId, polygon }) => {
          const event: TrackEventDto = {
            eventType: 'POLYGON_CREATE',
            payload: {
              characterId,
              pointsCount: polygon.points.length,
            },
          };
          this.analyticsService.trackEvent(event);
        }),
      ),
    { dispatch: false },
  );
}
