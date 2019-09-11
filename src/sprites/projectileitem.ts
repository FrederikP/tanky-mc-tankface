import { Item } from "./item";
import { Tank } from "./tank";

export class ProjectileItem extends Item {

    constructor(x: number, y: number) {
        super(x, y, "proj");
    }

    public getLabel(): string {
        return "one more projectile";
    }

    public apply(tank: Tank): void {
        tank.projectiles += 1;
    }

    protected renderItem(context: CanvasRenderingContext2D): void {
        context.fillStyle = "chartreuse";
        context.arc(-4, -4, 3, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(4, -4, 3, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(4, 4, 3, 0, 2 * Math.PI);
        context.fill();
    }

}
