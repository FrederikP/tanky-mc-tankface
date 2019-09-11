import { Effect } from "./effect";

export class MuzzleFlash extends Effect {

    private angle: number;

    constructor(x: number, y: number, direction: number) {
        super(x, y, 50);
        this.angle = direction;
    }

    protected renderEffect(context: CanvasRenderingContext2D) {
        context.fillStyle = "yellow";
        context.rotate(this.angle);
        context.fillRect(0, -1, this.progress() * 8, 2);
        context.fillRect(0, -2, 2, this.progress() * 6);
        context.fillRect(0, 2, 2, - this.progress() * 6);
    }

}
