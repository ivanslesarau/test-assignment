import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil, tap } from 'rxjs/operators';

import { SearchActions } from '../../store/actions/search.actions';
import {
  selectSearchResults,
  selectIsLoading,
  selectQuerySuggestions,
} from '../../store/selectors/search.selector';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

@Component({
  selector: 'app-typeahead-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule, ImageDialogComponent],
  templateUrl: './typeahead-search.component.html',
})
export class TypeaheadSearchComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  searchInput = new FormControl('');
  showSuggestions = false;
  currentPage = 1;

  results$ = this.store.select(selectSearchResults);
  isLoading$ = this.store.select(selectIsLoading);
  suggestions$!: Observable<any[]>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSuggestions = false;
    }
  }

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          this.currentPage = 1;
          const queryStr = query || '';

          this.suggestions$ = this.store.select(selectQuerySuggestions(queryStr));

          this.store.dispatch(
            SearchActions.searchRequest({ query: queryStr, page: this.currentPage }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  selectSuggestion(query: string): void {
    this.searchInput.setValue(query, { emitEvent: true });
    this.showSuggestions = false;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  onScrollIndexChange(index: number): void {
    const currentTotal = 30 * this.currentPage;
    const visibleItemsInView = Math.ceil(800 / 72);

    if (index + visibleItemsInView >= currentTotal - 2) {
      const currentQuery = this.searchInput.value || '';
      this.currentPage++;
      this.store.dispatch(
        SearchActions.searchRequest({ query: currentQuery, page: this.currentPage }),
      );
    }
  }

  selectedCharacter: any = null;

  openImageDialog(item: any): void {
    this.selectedCharacter = item;
  }

  closeImageDialog(): void {
    this.selectedCharacter = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
