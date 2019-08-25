import * as kontra from "kontra";
import { Enemy } from "./enemy";
import { Projectile } from "./projectile";
import { Tank } from "./tank";
import { Terrain } from "./terrain";

export class Turret extends Enemy {

    private radius = 10;
    private shootingSpeed = 65;
    private lastShot = 0;
    private msBetweenShots = 2000;

    private gunRotation = 0.75 * -Math.PI;
    private tank: Tank;

    constructor(x: number, y: number, tank: Tank) {
        super(x, y);
        this.tank = tank;
    }

    public collidesWith(projectile: Projectile) {
        const xDiff = projectile.x - this.x;
        const yDiff = projectile.y - this.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        let colliding = false;
        if (distance < this.radius + projectile.radius) {
            colliding = true;
        }
        return colliding;
    }

    protected renderEnemy(context: any) {
        context.fillStyle = "orange";
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();
        context.translate(0, -4);
        context.rotate(this.gunRotation);
        context.fillRect(0, -2, 20, 4);
    }

    protected updateEnemy(dt: number) {
        const { muzzleX, muzzleY } = this.getMuzzlePosition();
        if (Math.abs(muzzleX - this.x) < 500) {
            const x = this.tank.x - muzzleX;
            const y = -(this.tank.y - muzzleY);
            const speedSquared = Math.pow(this.shootingSpeed, 2);
            const toSqrt1 = Math.pow(speedSquared, 2);
            const toSqrt2 = 9.8 * (9.8 * Math.pow(x, 2) + 2 * y  * speedSquared);
            const rightSide = (speedSquared - Math.sqrt(toSqrt1 - toSqrt2)) / (9.8 * x);
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
                }
            }
        }
    }

    private fireGun() {
        const { muzzleX, muzzleY } = this.getMuzzlePosition();

        kontra.emit("spawnProjectile", muzzleX, muzzleY, this.gunRotation, this.shootingSpeed);
    }

    private getMuzzlePosition() {
        const originX = this.x;
        const originY = this.y - 2;
        const originMuzzleDiffX = Math.cos(this.gunRotation) * 30;
        const originMuzzleDiffY = Math.sin(this.gunRotation) * 30;
        const muzzleX = originX + originMuzzleDiffX;
        const muzzleY = originY + originMuzzleDiffY;
        return { muzzleX, muzzleY };
    }
}
