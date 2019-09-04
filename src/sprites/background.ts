import { on, Sprite } from "kontra";
import { GameDimensions } from "../dimensions";

export class Background extends Sprite.class {

    private starPatternX: number[];
    private starPatternY: number[];

    private sectorWidth: number;
    private sectorHeight: number;

    private gameDimensions: GameDimensions;

    constructor(gameDimensions: GameDimensions) {
        super();
        on("scroll", (offset: number) => {
            super.x = this.x - offset / 5;
        });
        this.starPatternX = [];
        this.starPatternY = [];
        this.gameDimensions = gameDimensions;
        this.sectorWidth = gameDimensions.width;
        this.sectorHeight = gameDimensions.height;
        for (let index = 0; index < 50; index++) {
            this.starPatternX.push(Math.round(Math.random() * gameDimensions.width));
            this.starPatternY.push(Math.round(Math.random() * gameDimensions.height));
        }
    }

    public render() {
        const context = this.context;
        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(this.gameDimensions.width / 2 + this.x + 12, 50, 30, 0, Math.PI * 2, true);
        context.fill();
        context.globalCompositeOperation = "destination-out";

        context.beginPath();
        context.arc(this.gameDimensions.width / 2 + this.x + 27, 50, 30, 0, Math.PI * 2, true);
        context.fill();

        context.globalCompositeOperation = "source-over";
        const sectorWidthRatio = this.gameDimensions.width / this.sectorWidth;

        for (let index = 0; index < this.starPatternX.length; index++) {
            const x = this.starPatternX[index];
            const y = this.starPatternY[index];
            const worldX = x + this.x;
            let screenX = worldX % this.sectorWidth;
            if (screenX < 0) {
                screenX = this.sectorWidth + screenX;
            }
            context.beginPath();
            let radius = 2;
            if (Math.random() > 0.99) {
                radius = Math.ceil(3 * Math.random());
            }
            context.arc(screenX * sectorWidthRatio, y * sectorWidthRatio, radius, 0, Math.PI * 2);
            context.fill();
        }
    }

}
