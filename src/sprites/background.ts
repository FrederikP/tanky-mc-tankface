import * as kontra from "kontra";
import { Constants } from "../constants";

export class Background extends kontra.Sprite.class {

    private starPatternX: number[];
    private starPatternY: number[];

    constructor() {
        super();
        kontra.on("scroll", (offset: number) => {
            super.x = this.x - offset / 5;
        });
        this.starPatternX = [];
        this.starPatternY = [];
        for (let index = 0; index < 50; index++) {
            this.starPatternX.push(Math.round(Math.random() * Constants.CANVAS_WIDTH));
            this.starPatternY.push(Math.round(Math.random() * Constants.CANVAS_HEIGHT));
        }
    }

    public render() {
        const context = this.context;
        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(Constants.CANVAS_WIDTH / 2 + this.x + 12, 50, 30, 0, Math.PI * 2, true);
        context.fill();
        context.globalCompositeOperation = "destination-out";

        context.beginPath();
        context.arc(Constants.CANVAS_WIDTH / 2 + this.x + 27, 50, 30, 0, Math.PI * 2, true);
        context.fill();

        context.globalCompositeOperation = "source-over";

        for (let index = 0; index < this.starPatternX.length; index++) {
            const x = this.starPatternX[index];
            const y = this.starPatternY[index];
            const worldX = x + this.x;
            let screenX = worldX % Constants.CANVAS_WIDTH;
            if (screenX < 0) {
                screenX = Constants.CANVAS_WIDTH + screenX;
            }
            context.beginPath();
            let radius = 2;
            if (Math.random() > 0.99) {
                radius = Math.ceil(3 * Math.random());
            }
            context.arc(screenX, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }

}
