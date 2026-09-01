import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  ɵprovideZonelessChangeDetectionInternal,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { searchReducer } from './store/reducers/search.reducer';
import { SearchEffects } from './store/effects/search.effects';
import { polygonReducer } from './store/reducers/polygon.reducer';
import { AnalyticsEffects } from './store/effects/analytics.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideStore({ search: searchReducer, polygons: polygonReducer }),
    provideEffects([SearchEffects, AnalyticsEffects]),
    ɵprovideZonelessChangeDetectionInternal(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
  ],
};
