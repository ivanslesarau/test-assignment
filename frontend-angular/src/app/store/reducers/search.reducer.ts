import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { SearchQuery } from '../models/search-query.model';
import { SearchActions } from '../actions/search.actions';

export interface SearchState extends EntityState<SearchQuery> {
  results: any[];
  total: number;
  loading: boolean;
  error: string | null;
  currentQuery: string;
}

export const searchAdapter = createEntityAdapter<SearchQuery>({
  selectId: (query) => query.id,
});

export const initialState: SearchState = searchAdapter.getInitialState({
  results: [],
  total: 0,
  loading: false,
  error: null,
  currentQuery: '',
});

export const searchReducer = createReducer(
  initialState,
  on(SearchActions.searchRequest, (state, { query, page }) => ({
    ...state,
    loading: true,
    error: null,
    results: page === 1 ? [] : state.results,
    currentQuery: query,
  })),
  on(SearchActions.searchSuccess, (state, { items, total, query }) => {
    const combinedResults = [...state.results, ...items];

    let updatedState = {
      ...state,
      results: combinedResults,
      total,
      loading: false,
    };

    if (items.length > 0 && query.trim().length > 0) {
      updatedState = searchAdapter.upsertOne(
        { id: query.toLowerCase(), query, timestamp: Date.now() },
        updatedState,
      );
    }

    return updatedState;
  }),
  on(SearchActions.searchFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
