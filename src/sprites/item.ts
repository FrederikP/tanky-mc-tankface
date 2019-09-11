import { getContext, Vector } from "../kontra/kontra";
import { Tank } from "./tank";

export abstract class Item extends Vector {

    public name: string;

    constructor(x: number, y: number, name: string) {
        super(x, y);
        this.name = name;
    }

    public render() {
        const context = getContext();
        context.save();
        context.translate(this.x, this.y);
        context.beginPath();
        this.renderItem(context);
        context.restore();
    }

    public scroll(offset: number) {
        super.x = this.x - offset;
    }

    public abstract apply(tank: Tank): void;

    public abstract getLabel(): string;

    protected abstract renderItem(context: any): void;
}
