import { on, Sprite } from "kontra";

export class Projectile extends Sprite.class {

    private static prerendered: HTMLCanvasElement = Projectile.createCanvas();

    private static createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "white";
        context.arc(2, 2, 2, 0, 2 * Math.PI);
        context.fill();
        return canvas;
    }

    public damage = 1;

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
        on("scroll", (offset: number) => {
            super.x = this.x - offset;
            this.startX = this.startX - offset;
        });
    }

    public render() {
        const context = this.context;
        context.drawImage(Projectile.prerendered, this.x - 2, this.y - 2);
    }

    public update() {
        this.updatePositionsForBallisticCurve();
    }

    private updatePositionsForBallisticCurve() {
        const timePassed = (Date.now() - this.startTime) / 100;
        const xOffset = this.v0 * timePassed * Math.cos(-this.angle);
        const yOffset = this.v0 * timePassed * Math.sin(-this.angle) -
            0.5 * 9.8 * timePassed * timePassed;
        super.x = this.startX + xOffset;
        super.y = this.startY - yOffset;
    }

}
