export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  startX: number;
  startY: number;
  color: string;
  thickness: number;
  path: Array<Point>;
}
