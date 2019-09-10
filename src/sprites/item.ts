import { Sprite } from "kontra";
import { Tank } from "./tank";

export abstract class Item extends Sprite.class {

    constructor(x: number, y: number) {
        super({
            x,
            y,
        });
    }

    public render() {
        const context = this.context;
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
