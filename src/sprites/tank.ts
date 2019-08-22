import * as kontra from "kontra";

export class Tank extends kontra.Sprite.class {

    public width = 40;

    private radius = 10;
    private height = 20;

    constructor(x: number, y: number) {
        super({
            color: "grey",
            dx: 2,
            x: 100,
            y: 600,
        });
    }

    public render() {
        const context = this.context;

        context.beginPath();
        context.fillStyle = "silver";
        context.arc(this.x + (this.width / 2), this.y, this.radius, Math.PI, 0);
        context.fill();
        context.beginPath();
        context.fillStyle = "grey";
        context.fillRect(this.x, this.y, this.width, this.height);
        context.beginPath();
        context.fillStyle = "black";
        context.ellipse(this.x + (this.width / 2), this.y + this.height / 1.5,
            this.width / 1.5, this.height / 2, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.fillStyle = "grey";
        context.ellipse(this.x + (this.width / 2), this.y + this.height / 1.5,
            this.width / 2, this.height / 2.8, 0, 0, Math.PI * 2);
        context.fill();
    }
}
