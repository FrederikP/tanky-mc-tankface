import * as kontra from "kontra";
import { Constants } from "../constants";
import { Score } from "../score";
import { Tank } from "./tank";

const HEALTHBAR_WIDTH = 300;

export class HUD extends kontra.Sprite.class {
    private tank: Tank;
    private score: Score;

    constructor(tank: Tank, score: Score) {
        super();
        this.tank = tank;
        this.score = score;
    }

    public render() {
        const context = this.context;
        context.beginPath();
        const healthMid = HEALTHBAR_WIDTH * (this.tank.health / this.tank.maxHealth);
        context.fillStyle = "green";
        context.fillRect(100, Constants.CANVAS_HEIGHT - 40, healthMid, 30);
        context.fillStyle = "red";
        context.fillRect(100 + healthMid, Constants.CANVAS_HEIGHT - 40, HEALTHBAR_WIDTH - healthMid, 30);
        context.fillStyle = "black";
        context.font = "20px Arial";
        context.fillText(`${this.tank.health} / ${this.tank.maxHealth} HP`, 130, Constants.CANVAS_HEIGHT - 20);
        context.beginPath();
        const powerMid = HEALTHBAR_WIDTH * (this.tank.power / 100);
        context.fillStyle = "orange";
        context.fillRect(500, Constants.CANVAS_HEIGHT - 40, powerMid, 30);
        context.fillStyle = "grey";
        context.fillRect(500 + powerMid, 730, HEALTHBAR_WIDTH - powerMid, 30);
        if (this.tank.isReloading()) {
            context.fillStyle = "black";
            context.font = "20px Arial";
            context.fillText(`RELOADING`, 530, Constants.CANVAS_HEIGHT - 20);
        }
        context.fillStyle = "orange";
        context.fillText(`Damage/Shot: ${new Intl.NumberFormat("en-us", {maximumFractionDigits: 2}).format(this.tank.damage)}`,
            920, Constants.CANVAS_HEIGHT - 20);

        context.beginPath();
        context.fillStyle = "yellow";
        context.font = "20px Arial";
        context.fillText(`Current Score: ${this.score.getScore()}`, Constants.CANVAS_WIDTH - 300, 40);
        if (this.score.newHighscore()) {
            context.fillStyle = "pink";
            context.fillText(`NEW HIGHSCORE!`, Constants.CANVAS_WIDTH - 300, 70);
        } else {
            context.fillStyle = "white";
            context.fillText(`Highscore: ${this.score.getHighscore()}`, Constants.CANVAS_WIDTH - 300, 70);
        }

        context.fillStyle = "white";
        context.font = "15px Arial";
        let currentY = 130;
        const labelCounts = this.tank.getPickedUpItemsLabelCounts();
        if (Object.keys(labelCounts).length > 0) {
            context.fillText(`Modifiers for next run:`, Constants.CANVAS_WIDTH - 300, currentY);

            for (const label of Object.keys(labelCounts)) {
                const count = labelCounts[label];
                currentY += 20;
                context.fillText(`${count} x ${label}`, Constants.CANVAS_WIDTH - 300, currentY);
            }
        }
    }

}
