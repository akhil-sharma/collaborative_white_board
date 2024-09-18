export interface Point {
    x: number;
    y: number;
}
  
export interface CanvasElement {
    color: string;
    lineWidth: number;
    points: Array<Point>;
    type: ToolTypes;
    id: string;
}

export enum ToolTypes {
    LINE = "line",
    RECTANGLE = "rectangle",
    FREE_HAND = "free_hand",
    CIRCLE = "circle",
    ERASER = "eraser"
}