import { Routes } from '@angular/router';
import { TypeaheadSearchComponent } from './components/typeahead-search/typeahead-search.component';

export const routes: Routes = [
  {
    path: '',
    component: TypeaheadSearchComponent,
    title: 'Search',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
