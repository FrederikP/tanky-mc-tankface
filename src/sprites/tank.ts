import * as kontra from "kontra";

export class Tank extends kontra.Sprite.class {

    public width = 40;

    private radius = 10;
    private height = 20;

    private gunRotation = 0;

    private faceLeft = false;

    constructor(x: number, y: number) {
        super({
            color: "grey",
            x: 100,
            y: 600,
        });
    }

    public render() {
        const context = this.context;

        context.save();
        context.translate(this.x + this.width / 2, this.y);
        if (this.faceLeft) {
            context.scale(-1, 1);
        }
        context.beginPath();
        context.fillStyle = "silver";
        context.arc(0, 0, this.radius, Math.PI, 0);
        context.fill();
        context.beginPath();
        context.fillStyle = "grey";
        context.fillRect(- this.width / 2, 0, this.width, this.height);
        context.beginPath();
        context.fillStyle = "black";
        context.ellipse(0, this.height / 1.5,
            this.width / 1.5, this.height / 2, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.fillStyle = "grey";
        context.ellipse(0, this.height / 1.5,
            this.width / 2, this.height / 2.8, 0, 0, Math.PI * 2);
        context.fill();
        context.translate(0, -4);
        context.rotate(this.gunRotation);
        context.fillStyle = "silver";
        context.fillRect(0, -2, 30, 4);
        context.restore();

    }

    public liftGun(dt: number) {
        if (this.gunRotation >  ((- Math.PI / 2) + (Math.PI / 6))) {
            this.gunRotation = this.gunRotation - Math.PI * (dt / 5);
        }
    }

    public lowerGun(dt: number) {
        if (this.gunRotation < (0 + Math.PI / 16)) {
            this.gunRotation = this.gunRotation + Math.PI * (dt / 5);
        }
    }

    public goLeft(dt: number) {
        super.x = this.x - dt * 50;
        this.faceLeft = true;
    }

    public goRight(dt: number) {
        super.x = this.x + dt * 50;
        this.faceLeft = false;
    }
}
