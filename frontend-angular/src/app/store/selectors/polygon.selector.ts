import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PolygonState } from '../reducers/polygon.reducer';

export const selectPolygonState = createFeatureSelector<PolygonState>('polygons');

export const selectPolygonsByCharacter = (characterId: number) =>
  createSelector(selectPolygonState, (state) => state?.polygonsByCharacter[characterId] || []);
