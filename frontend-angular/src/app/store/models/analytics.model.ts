export interface SearchEventPayload {
  query: string;
}

export interface PolygonEventPayload {
  characterId: number;
  pointsCount: number;
}

export interface TrackEventDto {
  eventType: 'SEARCH' | 'POLYGON_CREATE';
  payload: SearchEventPayload | PolygonEventPayload;
}
