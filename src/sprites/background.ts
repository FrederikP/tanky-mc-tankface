import { on, Sprite } from "kontra";
import { GameDimensions } from "../dimensions";

export class Background extends Sprite.class {

    private static prerenderedMoon: HTMLCanvasElement = Background.createMoon();
    private static prerenderedStar: HTMLCanvasElement = Background.createStar();

    private static createMoon() {
        const canvas = document.createElement("canvas");
        canvas.width = 40;
        canvas.height = 60;
        const context = canvas.getContext("2d")!;
        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(30, 30, 30, 0, Math.PI * 2, true);
        context.fill();
        context.globalCompositeOperation = "destination-out";

        context.beginPath();
        context.arc(40, 30, 30, 0, Math.PI * 2, true);
        context.fill();
        return canvas;
    }

    private static createStar() {
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        const context = canvas.getContext("2d")!;
        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(2, 2, 2, 0, Math.PI * 2);
        context.fill();
        return canvas;
    }

    private starPatternX: number[];
    private starPatternY: number[];

    private sectorWidth: number;

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
        for (let index = 0; index < 50; index++) {
            this.starPatternX.push(Math.round(Math.random() * gameDimensions.width));
            this.starPatternY.push(Math.round(Math.random() * gameDimensions.height));
        }
    }

    public render() {
        const context = this.context;
        context.drawImage(Background.prerenderedMoon, this.x + this.gameDimensions.width / 2, 150);
        const sectorWidthRatio = this.gameDimensions.width / this.sectorWidth;

        for (let index = 0; index < this.starPatternX.length; index++) {
            const x = this.starPatternX[index];
            const y = this.starPatternY[index];
            const worldX = x + this.x;
            let screenX = worldX % this.sectorWidth;
            if (screenX < 0) {
                screenX = this.sectorWidth + screenX;
            }
            context.drawImage(Background.prerenderedStar, screenX * sectorWidthRatio, y * sectorWidthRatio);
        }
    }

}
