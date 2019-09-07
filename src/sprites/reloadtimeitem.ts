import { Item } from "./item";
import { Tank } from "./tank";

export class ReloadTimeItem extends Item {

    public name = "reload";

    public getLabel(): string {
        return "20% less reload time";
    }

    public apply(tank: Tank): void {
        tank.reloadTime = tank.reloadTime * 0.8;
    }

    protected renderItem(context: any): void {
        context.fillStyle = "pink";
        context.fillRect(-10, -10, 4, 20);
        context.fillRect(-2, -10, 4, 20);
        context.fillRect(6, -10, 4, 20);
    }

}
