import { createReducer, on } from '@ngrx/store';
import { Polygon } from '../models/polygon.model';
import { PolygonActions } from '../actions/polygon.actions';

export interface PolygonState {
  polygonsByCharacter: Record<number, Polygon[]>;
}

export const initialPolygonState: PolygonState = {
  polygonsByCharacter: {},
};

export const polygonReducer = createReducer(
  initialPolygonState,
  on(PolygonActions.savePolygon, (state, { characterId, polygon }) => {
    const existing = state.polygonsByCharacter[characterId] || [];
    return {
      ...state,
      polygonsByCharacter: {
        ...state.polygonsByCharacter,
        [characterId]: [...existing, polygon],
      },
    };
  }),
  on(PolygonActions.updatePolygon, (state, { characterId, polygon }) => {
    const existing = state.polygonsByCharacter[characterId] || [];
    return {
      ...state,
      polygonsByCharacter: {
        ...state.polygonsByCharacter,
        [characterId]: existing.map((p) => (p.id === polygon.id ? polygon : p)),
      },
    };
  }),
);
