import { Item } from "./item";
import { Tank } from "./tank";

export class HealthItem extends Item {

    constructor(x: number, y: number) {
        super(x, y, "health");
    }
    public getLabel(): string {
        return "double health";
    }

    public apply(tank: Tank): void {
        tank.setInitialHealth(tank.getInitialHealth() * 2);
    }

    protected renderItem(context: any): void {
        context.fillStyle = "red";
        context.fillRect(-10, -3, 20, 6);
        context.fillRect(-3, -10, 6, 20);
    }

}
