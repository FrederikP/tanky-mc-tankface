import { Item } from "./item";
import { Tank } from "./tank";

export class DamageItem extends Item {

    constructor(x: number, y: number) {
        super(x, y, "damage");
    }

    public getLabel(): string {
        return "double damage";
    }

    public apply(tank: Tank): void {
        tank.damage *= 2;
    }

    protected renderItem(context: CanvasRenderingContext2D): void {
        context.fillStyle = "yellow";
        context.rotate(45 * Math.PI / 180);
        context.fillRect(-10, -3, 20, 6);
        context.fillRect(-3, -10, 6, 20);
    }

}
