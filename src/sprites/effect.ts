import { on, Sprite } from "kontra";

export abstract class Effect extends Sprite.class {

    protected startTime = Date.now();
    private ttl: number;

    constructor(x: number, y: number, ttl: number) {
        super({
            x,
            y,
        });
        on("scroll", (offset: number) => {
            super.x = this.x - offset;
        });
        this.ttl = ttl;
    }

    public render() {
        const context = this.context;
        context.save();
        context.translate(this.x, this.y);
        context.beginPath();
        this.renderEffect(context);
        context.restore();
    }

    public effectDone() {
        return this.progress() > 1;
    }

    protected progress() {
        return (Date.now() - this.startTime) / this.ttl;
    }

    protected abstract renderEffect(context: any): void;

}
