export function circleAndRectangleCollide(circleX: number, circleY: number, circleRadius: number,
                                          rectangleX: number, rectangleY: number, rectangleWidth: number,
                                          rectangleHeight: number): boolean {
    const closestX = Math.min(Math.max(circleX, rectangleX), rectangleX + rectangleWidth);
    const closestY = Math.min(Math.max(circleY, rectangleY), rectangleY + rectangleHeight);
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circleRadius * circleRadius);
}
