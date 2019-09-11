import { getUpdatedPositionForBallisticCurve } from "../util";
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

    public scroll(offset: number) {
        super.scroll(offset);
        this.startX = this.startX - offset;
    }

    protected renderEffect(context: any) {
        const pos = getUpdatedPositionForBallisticCurve(this.startTime, this.v0, this.angle, this.startX, this.startY);
        super.x = pos.x;
        super.y = pos.y;
        context.drawImage(this.prerenderedCanvas, 0, 0);
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

}
