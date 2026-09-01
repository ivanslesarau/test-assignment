import { createActionGroup, props } from '@ngrx/store';
import { SearchQuery } from '../models/search-query.model';

export const SearchActions = createActionGroup({
  source: 'Search API',
  events: {
    'Search Request': props<{ query: string; page: number }>(),
    'Search Success': props<{ items: any[]; total: number; query: string }>(),
    'Search Failure': props<{ error: string }>(),
    'Save Query': props<{ query: SearchQuery }>(),
  },
});
