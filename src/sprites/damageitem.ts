import { Item } from "./item";
import { Tank } from "./tank";

export class DamageItem extends Item {

    public name = "damage";

    public getLabel(): string {
        return "50% more damage";
    }

    public apply(tank: Tank): void {
        tank.damage *= 1.5;
    }

    protected renderItem(context: any): void {
        context.fillStyle = "yellow";
        context.rotate(45 * Math.PI / 180);
        context.fillRect(-10, -3, 20, 6);
        context.fillRect(-3, -10, 6, 20);
    }

}
