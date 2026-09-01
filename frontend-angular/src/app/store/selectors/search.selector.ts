import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SearchState, searchAdapter } from '../reducers/search.reducer';

export const selectSearchState = createFeatureSelector<SearchState>('search');

const { selectAll } = searchAdapter.getSelectors();

export const selectAllSavedQueries = createSelector(selectSearchState, selectAll);
export const selectSearchResults = createSelector(selectSearchState, (state) => state.results);
export const selectIsLoading = createSelector(selectSearchState, (state) => state.loading);

export const selectQuerySuggestions = (input: string) =>
  createSelector(selectAllSavedQueries, (savedQueries) => {
    if (!input.trim()) return savedQueries;

    const searchTerms = input.toLowerCase().split(' ').filter(Boolean);

    return savedQueries.filter((item) =>
      searchTerms.some((term) => item.query.toLowerCase().includes(term)),
    );
  });
