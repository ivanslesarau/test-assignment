import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SearchActions } from '../actions/search.actions';
import { SearchService } from '../../services/search.service';

@Injectable()
export class SearchEffects {
  private actions$ = inject(Actions);
  private searchService = inject(SearchService);

  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.searchRequest),
      switchMap(({ query, page }) =>
        this.searchService.search(query, page).pipe(
          map((response) =>
            SearchActions.searchSuccess({
              items: response.items,
              total: response.total,
              query,
            }),
          ),
          catchError((error) =>
            of(
              SearchActions.searchFailure({
                error: error?.message || 'Error occurred during search',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
