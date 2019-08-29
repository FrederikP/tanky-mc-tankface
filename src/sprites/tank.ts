import * as kontra from "kontra";
import { Constants } from "../constants";
import { circleAndRectangleCollide } from "../util";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export class Tank extends kontra.Sprite.class {

    public maxHealth = 3;
    public health = this.maxHealth;

    public power = 0;

    public lastShot = 0;

    public width = 40;

    private radius = 10;
    private height = 20;

    private timeToReload = 1000;

    private gunRotation = 0;

    private faceLeft = false;
    private terrain: Terrain;

    private terrainRotationAngle = 0;
    private damage = 1;

    constructor(x: number, y: number, terrain: Terrain) {
        super({
            x,
            y,
        });
        kontra.on("scroll", (offset: number) => {
            super.x = this.x - offset;
        });
        this.terrain = terrain;
    }

    public render() {
        const context = this.context;
        context.save();
        context.translate(this.x, this.y);
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

    public isReloading() {
        return Date.now() - this.lastShot < this.timeToReload;
    }

    public update(dt: number) {
        if (!this.isReloading()) {
            if (kontra.keyPressed("space")) {
                if (this.power < 30) {
                    this.power = 35;
                } else {
                    this.power = Math.min(100, this.power + (dt * 100));
                }
            } else {
                if (this.power > 30) {
                    this.fireGun();
                    this.power = 0;
                    this.lastShot = Date.now();
                }
            }
        }
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
        if (this.x < Constants.CANVAS_WIDTH / 2 - 30) {
            this.terrain.scroll(-2);
        }
        if (this.x > Constants.CANVAS_WIDTH / 2 + 30) {
            this.terrain.scroll(2);
        }
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
        super.x = this.x - dt * (80 - this.terrainRotationAngle * 60);
        this.faceLeft = true;
    }

    public goRight(dt: number) {
        super.x = this.x + dt * (80 + this.terrainRotationAngle * 60);
        this.faceLeft = false;
    }

    public fireGun() {
        const originXRotationDiff = 2 * Math.sin(this.terrainRotationAngle);
        const originYRotationDiff = - 2 * Math.cos(this.terrainRotationAngle);

        const originX = this.x + originXRotationDiff;
        const originY = this.y - 2 + originYRotationDiff;

        let rotation = this.gunRotation + this.terrainRotationAngle;
        if (this.faceLeft) {
            rotation = Math.PI - this.gunRotation + this.terrainRotationAngle;
        }

        const originMuzzleDiffX = Math.cos(rotation) * 30;
        const originMuzzleDiffY = Math.sin(rotation) * 30;

        const muzzleX = originX + originMuzzleDiffX;
        const muzzleY = originY + originMuzzleDiffY;

        kontra.emit("spawnProjectile", muzzleX, muzzleY, rotation, this.power, this.damage);
    }

    public isDead(): boolean {
        return this.health <= 0;
    }

    public collidesWith(projectile: Projectile) {
        const xDiff = projectile.x - this.x;
        const yDiff = projectile.y - this.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        let colliding = false;
        if (distance < this.radius + projectile.radius ||
            circleAndRectangleCollide(projectile.x, projectile.y, projectile.radius,
                                      this.x - this.width / 2, this.y - this.width / 2,
                                      this.width, this.height)) {
            colliding = true;
        }
        return colliding;
    }

    public takeDamage(projectile: Projectile) {
        this.health = this.health - projectile.damage;
    }

    private updateHeightAndRotation() {
        const left = Math.round(this.x - this.width / 2);
        const right = Math.round(left + this.width);
        const middle = Math.round(left + (right - left) / 2);
        const valuesLeft = [];
        for (let idx = left; idx < middle + 1; idx++) {
            valuesLeft.push(this.terrain.getGlobalHeight(idx));
        }
        const avgLeft = valuesLeft.reduce((a, b) => a + b, 0) / valuesLeft.length;
        const valuesRight = [];
        for (let idx = middle; idx < right + 1; idx++) {
            valuesRight.push(this.terrain.getGlobalHeight(idx));
        }
        const avgRight = valuesRight.reduce((a, b) => a + b, 0) / valuesRight.length;
        super.y = Math.round(avgLeft - ((avgLeft - avgRight) / 2)) - 20;
        this.terrainRotationAngle = Math.atan((avgRight - avgLeft) / this.width);
    }

}
