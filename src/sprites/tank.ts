import { emit, keyPressed, on, Sprite } from "kontra";
import { GameDimensions } from "../dimensions";
import { circleAndRectangleCollide } from "../util";
import { Item } from "./item";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export class Tank extends Sprite.class {

    public maxHealth = 3;
    public health = this.maxHealth;

    public power = 0;

    public lastShot = 0;

    public width = 40;

    public speed = 65;

    public damage = 1;

    public projectiles = 1;

    public readonly acceleration = 0.1;

    private radius = 10;
    private height = 20;

    private timeToReload = 1000;

    private gunRotation = 0;

    private faceLeft = false;
    private terrain: Terrain;

    private terrainRotationAngle = 0;

    private items: Item[] = [];
    private itemLabelCounts: Record<string, number> = {};

    private startedMovingLeftAt: number = -1;
    private startedMovingRightAt: number = -1;
    private gameDimensions: GameDimensions;

    constructor(x: number, y: number, gameDimensions: GameDimensions, terrain: Terrain) {
        super({
            x,
            y,
        });
        on("scroll", (offset: number) => {
            super.x = this.x - offset;
        });
        this.terrain = terrain;
        this.gameDimensions = gameDimensions;
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
            if (keyPressed("space")) {
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
        if (keyPressed("up")) {
            this.liftGun(dt);
        } else if (keyPressed("down")) {
            this.lowerGun(dt);
        }

        if (keyPressed("right")) {
            this.startedMovingLeftAt = -1;
            if (this.startedMovingRightAt < 0) {
                this.startedMovingRightAt = Date.now();
            }
            this.goRight(dt);
        } else if (keyPressed("left")) {
            this.startedMovingRightAt = -1;
            if (this.startedMovingLeftAt < 0) {
                this.startedMovingLeftAt = Date.now();
            }
            this.goLeft(dt);
        } else {
            this.startedMovingRightAt = -1;
            this.startedMovingLeftAt = -1;
        }
        this.updateHeightAndRotation();
        const gameWidth = this.gameDimensions.width;
        if (this.x < gameWidth / 2 - 30) {
            this.terrain.scroll(Math.round(this.x - (gameWidth / 2 - 30)));
        }
        if (this.x > gameWidth / 2 + 30) {
            this.terrain.scroll(Math.round(this.x - (gameWidth / 2 + 30)));
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
        super.x = this.x - dt * (Math.min(this.speed - this.terrainRotationAngle * 60, Math.max(2, this.acceleration *
            (Date.now() - this.startedMovingLeftAt)) - this.terrainRotationAngle * 60));
        this.faceLeft = true;
    }

    public goRight(dt: number) {
        super.x = this.x + dt * (Math.min(this.speed + this.terrainRotationAngle * 60, Math.max(2, this.acceleration *
            (Date.now() - this.startedMovingRightAt)) + this.terrainRotationAngle * 60));
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

        emit("spawnProjectile", muzzleX, muzzleY, rotation, this.power, this.damage);
        for (let index = 1; index < this.projectiles; index++) {
            emit("spawnProjectile", muzzleX, muzzleY, rotation + (Math.random() - 0.5) * (Math.PI / 10),
                this.power, this.damage);
        }
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

    public setInitialHealth(newHealth: number) {
        this.maxHealth = newHealth;
        this.health = newHealth;
    }

    public getInitialHealth(): number {
        return this.maxHealth;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public pickUp(item: Item) {
        this.items.push(item);
        const label = item.getLabel();
        if (!this.itemLabelCounts[label]) {
            this.itemLabelCounts[label] = 1;
        } else {
            this.itemLabelCounts[label] += 1;
        }
    }

    public getPickedUpItems() {
        return this.items;
    }

    public getPickedUpItemsLabelCounts() {
        return this.itemLabelCounts;
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
