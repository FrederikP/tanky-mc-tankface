import { Effect } from "./effect";

export class BlowupParticle extends Effect {

    private angle: number;
    private startX: number;
    private startY: number;
    private v0: number;
    private color: string;

    constructor(x: number, y: number, direction: number, v0: number, color: string) {
        super(x, y, 2000);
        this.startX = x;
        this.startY = y;
        this.angle = direction;
        this.v0 = v0;
        this.color = color;
    }

    protected renderEffect(context: any) {
        this.updatePositionsForBallisticCurve();
        context.fillStyle = this.color;
        context.arc(0, 0, 2, 0, 2 * Math.PI);
        context.fill();
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
