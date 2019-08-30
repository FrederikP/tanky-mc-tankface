import { Item } from "./item";
import { Tank } from "./tank";

export class SpeedItem extends Item {

    public getLabel(): string {
        return "20% more speed";
    }

    public apply(tank: Tank): void {
        tank.speed = tank.speed * 1.2;
    }

    protected renderItem(context: any): void {
        context.fillStyle = "pink";
        this.drawArrow(context, -4);
        this.drawArrow(context, 4);
    }

    private drawArrow(context: any, xOffset: number): void {
        context.moveTo(0 + xOffset, -10);
        context.lineTo(2 + xOffset, -10);
        context.lineTo(5 + xOffset, 0);
        context.lineTo(2 + xOffset, 10);
        context.lineTo(0 + xOffset, 10);
        context.fill();
    }

}
