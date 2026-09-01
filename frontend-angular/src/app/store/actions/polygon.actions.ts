import { createActionGroup, props } from '@ngrx/store';
import { Polygon } from '../models/polygon.model';

export const PolygonActions = createActionGroup({
  source: 'Polygon Canvas',
  events: {
    'Save Polygon': props<{ characterId: number; polygon: Polygon }>(),
    'Update Polygon': props<{ characterId: number; polygon: Polygon }>(),
  },
});
