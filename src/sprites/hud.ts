import { Sprite } from "kontra";
import { GameDimensions } from "../dimensions";
import { Score } from "../score";
import { Tank } from "./tank";

export class HUD extends Sprite.class {
    private tank: Tank;
    private score: Score;
    private gameDimensions: GameDimensions;

    constructor(tank: Tank, score: Score, gameDimensions: GameDimensions) {
        super();
        this.tank = tank;
        this.score = score;
        this.gameDimensions = gameDimensions;
    }

    public render() {
        const context = this.context;
        context.font = '1em "Lucida Console",Monaco,monospace';
        context.beginPath();
        const barWidth = this.gameDimensions.width / 5;
        const healthMid = barWidth * (this.tank.health / this.tank.maxHealth);
        context.fillStyle = "green";
        context.fillRect(this.gameDimensions.width / 9, this.gameDimensions.height - 40, healthMid, 30);
        context.fillStyle = "red";
        context.fillRect(this.gameDimensions.width / 9 + healthMid,
            this.gameDimensions.height - 40, barWidth - healthMid, 30);
        context.fillStyle = "black";
        context.fillText(`${new Intl.NumberFormat("en-us", {maximumFractionDigits: 2}).format(this.tank.health)}/${new Intl.NumberFormat("en-us", {maximumFractionDigits: 2}).format(this.tank.maxHealth)} HP`,
            this.gameDimensions.width / 9 + 20, this.gameDimensions.height - 16);
        context.beginPath();
        const powerMid = barWidth * (this.tank.power / 100);
        context.fillStyle = "orange";
        context.fillRect(this.gameDimensions.width / 5 * 2, this.gameDimensions.height - 40, powerMid, 30);
        context.fillStyle = "grey";
        context.fillRect(this.gameDimensions.width / 5 * 2 + powerMid, this.gameDimensions.height - 40,
            barWidth - powerMid, 30);
        if (this.tank.isReloading()) {
            context.fillStyle = "black";
            context.fillText(`RELOADING`, this.gameDimensions.width / 5 * 2 + 20, this.gameDimensions.height - 20);
        }
        context.fillStyle = "orange";
        context.fillText(`Damage/Shot: ${new Intl.NumberFormat("en-us", {maximumFractionDigits: 2}).format(this.tank.damage)}`,
            this.gameDimensions.width / 3 * 2, this.gameDimensions.height - 16);

        context.beginPath();
        context.fillStyle = "yellow";
        const scoreX = this.gameDimensions.width / 4 * 3;
        const lineDiff = this.gameDimensions.height / 30;
        context.fillText(`Current Score: ${this.score.getScore()}`, scoreX, 40);
        if (this.score.newHighscore()) {
            context.fillStyle = "pink";
            context.fillText(`NEW HIGHSCORE!`, scoreX, 70);
        } else {
            context.fillStyle = "white";
            context.fillText(`Highscore: ${this.score.getHighscore()}`, scoreX, 40 + lineDiff);
        }

        context.fillStyle = "white";
        let currentY = 40 + lineDiff * 3;
        const labelCounts = this.tank.getPickedUpItemsLabelCounts();
        if (Object.keys(labelCounts).length > 0) {
            context.fillText(`Modifiers for next run:`, scoreX, currentY);

            for (const label of Object.keys(labelCounts)) {
                const count = labelCounts[label];
                currentY += lineDiff;
                context.fillText(`${count} x ${label}`, scoreX, currentY);
            }
        }
    }

}
