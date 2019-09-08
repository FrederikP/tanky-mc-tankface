import { emit } from "kontra";
import { GameDimensions } from "../dimensions";
import { Enemy } from "./enemy";
import { Projectile } from "./projectile";
import { Tank } from "./tank";
import { Terrain } from "./terrain";

export class Turret extends Enemy {

    private shootingSpeed: number;
    private msBetweenShots: number;
    private directTrajectory: boolean;
    private inaccuracy: number;
    private damage: number;

    private radius = 10;
    private gunRotation = 0.75 * -Math.PI;
    private tank: Tank;
    private lastShot = Date.now();

    private seenTanky = false;
    private currentInaccuracyX: number;
    private currentInaccuracyY: number;
    private gameDimensions: GameDimensions;

    constructor(x: number, tank: Tank, shootingSpeed: number,
                msBetweenShots: number, directTrajectory: boolean, inaccuracy: number,
                maxHealth: number, damage: number, points: number,
                gameDimensions: GameDimensions, terrain: Terrain) {
        super(x, maxHealth, points, terrain);
        this.tank = tank;
        this.shootingSpeed = shootingSpeed;
        this.msBetweenShots = msBetweenShots;
        this.directTrajectory = directTrajectory;
        this.inaccuracy = inaccuracy;
        this.currentInaccuracyX = (Math.random() - 0.5) * 2 * this.inaccuracy;
        this.currentInaccuracyY = (Math.random() - 0.5) * 2 * this.inaccuracy;
        this.damage = damage;
        this.gameDimensions = gameDimensions;
    }

    public collidesWith(projectile: Projectile) {
        const xDiff = projectile.x - this.x;
        const yDiff = projectile.y - this.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        let colliding = false;
        if (distance < this.radius + 2 || (Math.abs(xDiff) < this.radius && projectile.y > this.y)) {
            colliding = true;
        }
        return colliding;
    }

    protected renderEnemy(context: any) {
        context.beginPath();
        context.fillStyle = "grey";
        context.fillRect(- this.radius, 0, this.radius * 2, 200);
        let turretColor = "green";
        if (this.tank.health < this.damage) {
            turretColor = "red";
        } else if (this.tank.health / 2 < this.damage) {
            turretColor = "orange";
        }
        context.fillStyle = turretColor;
        context.arc(0, 0, this.radius, Math.PI, 0);
        context.fill();
        context.beginPath();
        context.fillStyle = turretColor;
        context.translate(0, -4);
        context.rotate(this.gunRotation);
        context.fillRect(0, -2, 20, 4);
    }

    protected updateEnemy(dt: number) {
        const { muzzleX, muzzleY } = this.getMuzzlePosition();
        if (this.seenTanky || Math.abs(muzzleX - this.tank.x) < this.gameDimensions.width / 2) {
            this.seenTanky = true;
            const x = this.tank.x - muzzleX + this.currentInaccuracyX;
            const y = -(this.tank.y - muzzleY + this.currentInaccuracyY);
            const speedSquared = Math.pow(this.shootingSpeed, 2);
            const toSqrt1 = Math.pow(speedSquared, 2);
            const toSqrt2 = 9.8 * (9.8 * Math.pow(x, 2) + 2 * y  * speedSquared);
            let rightSide;
            if (this.directTrajectory) {
                rightSide = (speedSquared - Math.sqrt(toSqrt1 - toSqrt2)) / (9.8 * x);
            } else {
                rightSide = (speedSquared + Math.sqrt(toSqrt1 - toSqrt2)) / (9.8 * x);
            }
            if (rightSide) {
                const angle = Math.atan(rightSide);
                let targetGunRotation;
                if (this.tank.x - muzzleX > 0) {
                    targetGunRotation = - angle;
                } else {
                    targetGunRotation = - Math.PI - angle;
                }
                this.gunRotation = this.gunRotation - Math.min(this.gunRotation - targetGunRotation, 20) * dt;
                if (Date.now() - this.lastShot > this.msBetweenShots) {
                    this.fireGun();
                    this.lastShot = Date.now();
                    this.currentInaccuracyX = (Math.random() - 0.5) * 2 * this.inaccuracy;
                    this.currentInaccuracyY = (Math.random() - 0.5) * 2 * this.inaccuracy;
                }
            }
        }
    }

    private fireGun() {
        const { muzzleX, muzzleY } = this.getMuzzlePosition();

        emit("spawnProjectile", muzzleX, muzzleY, this.gunRotation, this.shootingSpeed, this.damage);
    }

    private getMuzzlePosition() {
        const originX = this.x;
        const originY = this.y - 2;
        const originMuzzleDiffX = Math.cos(this.gunRotation) * 20;
        const originMuzzleDiffY = Math.sin(this.gunRotation) * 20;
        const muzzleX = originX + originMuzzleDiffX;
        const muzzleY = originY + originMuzzleDiffY;
        return { muzzleX, muzzleY };
    }
}
