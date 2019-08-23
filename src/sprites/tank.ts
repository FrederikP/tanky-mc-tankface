import * as kontra from "kontra";
import { Terrain } from "./terrain";

export class Tank extends kontra.Sprite.class {

    public width = 40;

    private radius = 10;
    private height = 20;

    private gunRotation = 0;

    private faceLeft = false;
    private terrain: Terrain;

    private terrainRotationAngle = 0;

    constructor(x: number, y: number, terrain: Terrain) {
        super({
            x,
            y,
        });
        kontra.bindKeys(["space"], (e: any) => {
            e.preventDefault();
            this.fireGun();
        });
        this.terrain = terrain;
    }

    public render() {
        const context = this.context;
        context.save();
        context.translate(this.x + this.width / 2, this.y);
        if (this.faceLeft) {
            context.scale(-1, 1);
            context.rotate(-this.terrainRotationAngle);
        } else {
            context.rotate(this.terrainRotationAngle);
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

    public update(dt: number) {
        if (kontra.keyPressed("up")) {
            this.liftGun(dt);
        } else if (kontra.keyPressed("down")) {
            this.lowerGun(dt);
        }

        if (kontra.keyPressed("right")) {
            this.goRight(dt);
        } else if (kontra.keyPressed("left")) {
            this.goLeft(dt);
        }
        this.updateHeightAndRotation();
    }

    public liftGun(dt: number) {
        if (this.gunRotation >  ((- Math.PI / 2) + (Math.PI / 10))) {
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

    public fireGun() {
        const originXRotationDiff = 3 * Math.sin(this.terrainRotationAngle);
        const originYRotationDiff = - 3 * Math.cos(this.terrainRotationAngle);

        const originX = this.x + this.width / 2 + originXRotationDiff;
        const originY = this.y - 3 + originYRotationDiff;

        let rotation = this.gunRotation + this.terrainRotationAngle;
        if (this.faceLeft) {
            rotation = Math.PI - this.gunRotation + this.terrainRotationAngle;
        }

        const originMuzzleDiffX = Math.cos(rotation) * 30;
        const originMuzzleDiffY = Math.sin(rotation) * 30;

        const muzzleX = originX + originMuzzleDiffX;
        const muzzleY = originY + originMuzzleDiffY;

        kontra.emit("spawnProjectile", muzzleX, muzzleY, rotation);
    }

    private updateHeightAndRotation() {
        const leftTerrainHeight = this.terrain.getGlobalHeight(this.x);
        const rightTerrainHeight = this.terrain.getGlobalHeight(this.x + this.width);
        super.y = Math.round(leftTerrainHeight - ((leftTerrainHeight - rightTerrainHeight) / 2)) - 20;
        this.terrainRotationAngle = Math.atan((rightTerrainHeight - leftTerrainHeight) / this.width);
    }

}
