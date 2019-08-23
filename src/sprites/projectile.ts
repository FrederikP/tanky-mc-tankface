import * as kontra from "kontra";

export class Projectile extends kontra.Sprite.class {

    private startTime = Date.now();

    private v0: number;
    private angle: number;
    private startX: number;
    private startY: number;

    constructor(x: number, y: number, initialDirection: number, v0: number) {
        super({
            x,
            y,
        });
        this.v0 = v0;
        this.angle = initialDirection;
        this.startX = x;
        this.startY = y;
    }

    public render() {
        const context = this.context;
        context.beginPath();
        context.fillStyle = "black";
        context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        context.fill();
    }

    public update() {
        const timePassedInSeconds = (Date.now() - this.startTime) / 100;
        const xOffset = this.v0 * timePassedInSeconds * Math.cos(-this.angle);
        const yOffset = this.v0 * timePassedInSeconds * Math.sin(-this.angle) -
            0.5 * 9.8 * timePassedInSeconds * timePassedInSeconds;
        super.x = this.startX + xOffset;
        super.y = this.startY - yOffset;
    }

}
