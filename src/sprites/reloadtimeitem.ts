import { Item } from "./item";
import { Tank } from "./tank";

export class ReloadTimeItem extends Item {

    constructor(x: number, y: number) {
        super(x, y, "reload");
    }

    public getLabel(): string {
        return "20% less reload time";
    }

    public apply(tank: Tank): void {
        tank.reloadTime = tank.reloadTime * 0.8;
    }

    protected renderItem(context: CanvasRenderingContext2D): void {
        context.fillStyle = "pink";
        context.fillRect(-10, -10, 4, 20);
        context.fillRect(-2, -10, 4, 20);
        context.fillRect(6, -10, 4, 20);
    }

}
