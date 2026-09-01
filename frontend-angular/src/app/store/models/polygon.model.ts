export interface Point {
  x: number; // (0..1)
  y: number; // (0..1)
}

export interface Polygon {
  id: string;
  characterId: number;
  points: Point[];
  rotation: number; // rotation in radians
}
