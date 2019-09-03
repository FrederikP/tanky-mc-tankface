import { on, Sprite } from "kontra";

export class TextLayer extends Sprite.class {

    constructor() {
        super();
        on("scroll", (offset: number) => {
            super.x = this.x - offset / 2;
        });
    }

    public render() {
        const context = this.context;
        context.font = '12px "Lucida Console",Monaco,monospace';
        if (Math.abs(this.x) < 2000) {
            context.beginPath();
            context.fillStyle = "rgba(255, 255, 255, 0.7)";
            context.fillRect(this.x + 50, 10, 420, 200);
            context.fillStyle = "black";
            const startText = `Welcome BACK Tanky McTankface,

your time has come to put your parts to the test.

You cannot win, as there are no winners in war
(except for the arms industry...).

When you break down, we will use parts you found to
build a better version of you.

left/right arrow key -> move the tank
up/down arrow key -> change gun angle
space -> hold to charge shot`;
            const split = startText.split("\n");
            for (let index = 0; index < split.length; index++) {
                const line = split[index];
                context.fillText(line, this.x + 55, 30 + (14 * index));
            }
        }
    }
}
