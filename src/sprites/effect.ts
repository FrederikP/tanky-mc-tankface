import { getContext, Vector } from "../kontra/kontra";

export abstract class Effect extends Vector {

    protected startTime = Date.now();
    private ttl: number;

    constructor(x: number, y: number, ttl: number) {
        super(x, y);
        this.ttl = ttl;
    }

    public render() {
        const context = getContext();
        context.save();
        context.translate(this.x, this.y);
        context.beginPath();
        this.renderEffect(context);
        context.restore();
    }

    public effectDone() {
        return this.progress() > 1;
    }

    public scroll(offset: number) {
        super.x = this.x - offset;
    }

    protected progress() {
        return (Date.now() - this.startTime) / this.ttl;
    }

    protected abstract renderEffect(context: any): void;

}
