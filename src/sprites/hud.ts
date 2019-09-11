import { GameDimensions } from "../dimensions";
import { getContext, Vector } from "../kontra/kontra";
import { Score } from "../score";
import { Tanky } from "./tanky";

const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(numberToAbbrev: number) {

    // what tier? (determines SI symbol)
    // tslint:disable-next-line: no-bitwise
    const tier = Math.log10(numberToAbbrev) / 3 | 0;

    // if zero, we don't need a suffix
    if (tier < 1) {
        return numberToAbbrev.toLocaleString("en-us", {maximumFractionDigits: 2});
    }

    // get suffix and determine scale
    const suffix = SI_SYMBOL[tier];
    const scale = Math.pow(10, tier * 3);

    // scale the number
    const scaled = numberToAbbrev / scale;

    // format number and add suffix
    return scaled.toFixed(2) + suffix;
}

export class HUD extends Vector {
    private tanky: Tanky;
    private score: Score;
    private gameDimensions: GameDimensions;

    constructor(tanky: Tanky, score: Score, gameDimensions: GameDimensions) {
        super();
        this.tanky = tanky;
        this.score = score;
        this.gameDimensions = gameDimensions;
    }

    public render() {
        const context = getContext();
        context.font = '1em "Lucida Console",Monaco,monospace';
        context.beginPath();
        const barWidth = this.gameDimensions.width / 5;
        const healthMid = barWidth * (this.tanky.health / this.tanky.maxHealth);
        context.fillStyle = "green";
        context.fillRect(this.gameDimensions.width / 9, this.gameDimensions.height - 40, healthMid, 30);
        context.fillStyle = "red";
        context.fillRect(this.gameDimensions.width / 9 + healthMid,
            this.gameDimensions.height - 40, barWidth - healthMid, 30);
        context.fillStyle = "black";
        const currentHealth = abbreviateNumber(this.tanky.health);
        const maxHealth = abbreviateNumber(this.tanky.maxHealth);
        context.fillText(`${currentHealth}/${maxHealth} HP`,
            this.gameDimensions.width / 9 + 20, this.gameDimensions.height - 16);
        context.beginPath();

        if (this.tanky.isReloading()) {
            const reloadMid = barWidth * this.tanky.reloadRatio();
            context.fillStyle = "white";
            context.fillRect(this.gameDimensions.width / 5 * 3, this.gameDimensions.height - 40, -reloadMid, 30);
            context.fillStyle = "grey";
            context.fillRect(this.gameDimensions.width / 5 * 2, this.gameDimensions.height - 40,
                barWidth - reloadMid, 30);
            context.fillStyle = "black";
            context.fillText(`RELOADING`, this.gameDimensions.width / 5 * 2 + 20, this.gameDimensions.height - 16);
        } else {
            const powerMid = barWidth * (this.tanky.power / 100);
            context.fillStyle = "orange";
            context.fillRect(this.gameDimensions.width / 5 * 2, this.gameDimensions.height - 40, powerMid, 30);
            context.fillStyle = "grey";
            context.fillRect(this.gameDimensions.width / 5 * 2 + powerMid, this.gameDimensions.height - 40,
                barWidth - powerMid, 30);
        }
        context.fillStyle = "orange";
        const damage = abbreviateNumber(this.tanky.damage);
        context.fillText(`Damage/Shot: ${damage}`, this.gameDimensions.width / 3 * 2, this.gameDimensions.height - 16);

        context.beginPath();
        context.fillStyle = "yellow";
        const scoreX = this.gameDimensions.width / 4 * 3;
        const lineDiff = this.gameDimensions.height / 30;
        const score = abbreviateNumber(this.score.getScore());
        context.fillText(`Current Score: ${score}`, scoreX, 40);
        if (this.score.newHighscore()) {
            context.fillStyle = "pink";
            context.fillText(`NEW HIGHSCORE!`, scoreX, 70);
        } else {
            context.fillStyle = "white";
            const highscore = abbreviateNumber(this.score.getHighscore());
            context.fillText(`Highscore: ${highscore}`, scoreX, 40 + lineDiff);
        }

        context.fillStyle = "white";
        let currentY = 40 + lineDiff * 3;
        const labelCounts = this.tanky.getPickedUpItemsLabelCounts();
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
