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

export function getUpdatedPositionForBallisticCurve(startTime: number, v0: number, angle: number,
                                                    startX: number, startY: number) {
    const timePassed = (Date.now() - startTime) / 100;
    const xOffset = v0 * timePassed * Math.cos(-angle);
    const yOffset = v0 * timePassed * Math.sin(-angle) -
        0.5 * 9.8 * timePassed * timePassed;
    const x = startX + xOffset;
    const y = startY - yOffset;
    return {x, y};
}
