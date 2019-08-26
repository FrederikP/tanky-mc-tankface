import * as kontra from "kontra";

export class Projectile extends kontra.Sprite.class {

    public damage = 1;
    public radius = 2;

    private startTime = Date.now();

    private v0: number;
    private angle: number;
    private startX: number;
    private startY: number;

    constructor(x: number, y: number, initialDirection: number, v0: number, damage: number) {
        super({
            x,
            y,
        });
        this.v0 = v0;
        this.angle = initialDirection;
        this.damage = damage;
        this.startX = x;
        this.startY = y;
        kontra.on("scroll", (offset: number) => {
            super.x = this.x - offset;
            this.startX = this.startX - offset;
        });
    }

    public render() {
        const context = this.context;
        context.beginPath();
        context.fillStyle = "white";
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
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
