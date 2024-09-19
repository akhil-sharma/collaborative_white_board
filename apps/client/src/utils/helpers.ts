export function toScreenX(xTrue: number, offsetX: number, scale: number) {
    return (xTrue + offsetX) * scale;
}
export function toScreenY(yTrue: number, offsetY: number, scale : number) {
    return (yTrue + offsetY) * scale;
}
export function toTrueX(xScreen: number, offsetX: number, scale: number) {
    return (xScreen / scale) - offsetX;
}
export function toTrueY(yScreen: number, offsetY: number, scale: number) {
    return (yScreen / scale) - offsetY;
}
export function trueHeight(canvasClientHeight: number, scale: number) {
    return canvasClientHeight / scale;
}
export function trueWidth(canvasClientWidth: number, scale: number) {
    return canvasClientWidth / scale;
}