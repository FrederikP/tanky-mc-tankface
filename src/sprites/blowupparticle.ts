import { Effect } from "./effect";

export class BlowupParticle extends Effect {

    private static prerendered: Record<string, HTMLCanvasElement> = {};

    private angle: number;
    private startX: number;
    private startY: number;
    private v0: number;
    private prerenderedCanvas: HTMLCanvasElement;

    constructor(x: number, y: number, direction: number, v0: number, color: string) {
        super(x, y, 300);
        this.startX = x;
        this.startY = y;
        this.angle = direction;
        this.v0 = v0;
        if (!BlowupParticle.prerendered[color]) {
            BlowupParticle.prerendered[color] = this.createParticle(color);
        }
        this.prerenderedCanvas = BlowupParticle.prerendered[color];
    }

    protected renderEffect(context: any) {
        this.updatePositionsForBallisticCurve();
        context.drawImage(this.prerenderedCanvas, 0, 0);
    }

    private updatePositionsForBallisticCurve() {
        const timePassed = (Date.now() - this.startTime) / 100;
        const xOffset = this.v0 * timePassed * Math.cos(-this.angle);
        const yOffset = this.v0 * timePassed * Math.sin(-this.angle) -
            0.5 * 9.8 * timePassed * timePassed;
        super.x = this.startX + xOffset;
        super.y = this.startY - yOffset;
    }

    private createParticle(color: string) {
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        const context = canvas.getContext("2d")!;
        context.fillStyle = color;
        context.arc(2, 2, 2, 0, 2 * Math.PI);
        context.fill();
        return canvas;
    }

    public scroll(offset: number) {
        super.scroll(offset);
        this.startX = this.startX - offset;
    }
}
