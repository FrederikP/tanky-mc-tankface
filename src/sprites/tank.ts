import { emit, keyPressed, on, Sprite } from "kontra";
import { GameDimensions } from "../dimensions";
import { Sound } from "../sounds/sound";
import { circleAndRectangleCollide } from "../util";
import { BlowupParticle } from "./blowupparticle";
import { Effect } from "./effect";
import { Item } from "./item";
import { Machine } from "./machine";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export abstract class Tank extends Machine {

    public power = 0;

    public lastShot = 0;

    public width = 40;

    public speed = 65;

    public damage = 1;

    public projectiles = 1;

    public readonly acceleration = 0.1;

    public reloadTime = 1500;

    protected gunRotation = 0;
    protected faceLeft = false;

    protected startedMovingLeftAt: number = -1;
    protected startedMovingRightAt: number = -1;

    protected gameDimensions: GameDimensions;

    protected terrainRotationAngle = 0;

    private radius = 10;
    private height = 20;

    private effects: Effect[];

    constructor(x: number, gameDimensions: GameDimensions, terrain: Terrain,
                effects: Effect[], showHealthBar = false, points = 0) {
        super(x, 1, terrain, showHealthBar, points);
        this.gameDimensions = gameDimensions;
        this.effects = effects;
    }

    public renderMachine(context: any) {
        if (this.faceLeft) {
            context.scale(-1, 1);
            context.rotate(-this.terrainRotationAngle);
        } else {
            context.rotate(this.terrainRotationAngle);
        }
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
        context.beginPath();
        context.fillStyle = this.getTurretColor();
        context.arc(0, 0, this.radius, Math.PI, 0);
        context.fill();
        context.translate(0, -4);
        context.rotate(this.gunRotation);
        context.fillRect(0, -2, 30, 4);

    }

    public updateMachine(dt: number) {
        this.moveTank(dt);
        this.updateHeightAndRotation();
    }

    public isDead(): boolean {
        return this.health <= 0;
    }

    public collidesWith(projectile: Projectile) {
        const xDiff = projectile.x - this.x;
        const yDiff = projectile.y - this.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        let colliding = false;
        if (distance < this.radius + 2 ||
            circleAndRectangleCollide(projectile.x, projectile.y, 2,
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

    public isReloading() {
        return Date.now() - this.lastShot < this.reloadTime;
    }

    protected abstract getTurretColor(): string;

    protected abstract moveTank(dt: number): void;

    protected goLeft(dt: number) {
        super.x = this.x - dt * (Math.min(this.speed - this.terrainRotationAngle * 60, Math.max(2, this.acceleration *
            (Date.now() - this.startedMovingLeftAt)) - this.terrainRotationAngle * 60));
        this.faceLeft = true;
        this.onDrive();
    }

    protected goRight(dt: number) {
        super.x = this.x + dt * (Math.min(this.speed + this.terrainRotationAngle * 60, Math.max(2, this.acceleration *
            (Date.now() - this.startedMovingRightAt)) + this.terrainRotationAngle * 60));
        this.faceLeft = false;
        this.onDrive();
    }

    protected fireGun() {
        const { originX, originY } = this.getProjectileOrigin();

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

    protected getProjectileOrigin() {
        const originXRotationDiff = 2 * Math.sin(this.terrainRotationAngle);
        const originYRotationDiff = -2 * Math.cos(this.terrainRotationAngle);
        const originX = this.x + originXRotationDiff;
        const originY = this.y - 2 + originYRotationDiff;
        return { originX, originY };
    }

    private onDrive() {
        if (Math.random() > 0.6) {
            this.blowUpParticle();
        }
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

    private blowUpParticle() {
        const diff = Math.PI / 4 + Math.random() * Math.PI / 4;
        const angle = - Math.PI / 2 + (this.faceLeft ? diff : -diff);
        const v0 = 5 + Math.random() * 20;
        const xDiff = Math.random() * this.width / 2 * (this.faceLeft ? 1 : -1);
        const particle: Effect = new BlowupParticle(this.x + xDiff, this.y + 20, angle, v0, "#663300");
        this.effects.push(particle);
    }

}
