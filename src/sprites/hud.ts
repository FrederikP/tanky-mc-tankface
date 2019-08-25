import * as kontra from "kontra";
import { Tank } from "./tank";

const HEALTHBAR_WIDTH = 300;

export class HUD extends kontra.Sprite.class {
    private tank: Tank;

    constructor(tank: Tank) {
        super();
        this.tank = tank;
    }

    public render() {
        const context = this.context;
        context.beginPath();
        const healthMid = HEALTHBAR_WIDTH * (this.tank.health / this.tank.maxHealth);
        context.fillStyle = "green";
        context.fillRect(100, 730, healthMid, 30);
        context.fillStyle = "red";
        context.fillRect(100 + healthMid, 730, HEALTHBAR_WIDTH - healthMid, 30);
        context.fillStyle = "black";
        context.font = "20px Arial";
        context.fillText(`${this.tank.health} / ${this.tank.maxHealth} HP`, 130, 750);
        context.beginPath();
        const powerMid = HEALTHBAR_WIDTH * (this.tank.power / 100);
        context.fillStyle = "orange";
        context.fillRect(500, 730, powerMid, 30);
        context.fillStyle = "grey";
        context.fillRect(500 + powerMid, 730, HEALTHBAR_WIDTH - powerMid, 30);
    }

}
