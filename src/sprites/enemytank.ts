import { GameDimensions } from "../dimensions";
import { Effect } from "./effect";
import { Tank } from "./tank";
import { Tanky } from "./tanky";
import { Terrain } from "./terrain";

export class EnemyTank extends Tank {

    private msBetweenShots: number;
    private directTrajectory: boolean;
    private inaccuracy: number;
    private tanky: Tanky;

    private timeLastTurn = performance.now();

    private currentInaccuracyX: number;
    private currentInaccuracyY: number;
    private nextTripDuration: number;

    private seenTanky = false;

    constructor(x: number, gameDimensions: GameDimensions, terrain: Terrain,
                effects: Effect[], points: number, shootingSpeed: number,
                msBetweenShots: number, directTrajectory: boolean, inaccuracy: number,
                damage: number, tanky: Tanky) {
        super(x, gameDimensions, terrain, effects, true, points);
        this.msBetweenShots = msBetweenShots;
        this.directTrajectory = directTrajectory;
        this.inaccuracy = inaccuracy;
        this.damage = damage;
        this.power = shootingSpeed;
        this.tanky = tanky;
        this.currentInaccuracyX = (Math.random() - 0.5) * 2 * this.inaccuracy;
        this.currentInaccuracyY = (Math.random() - 0.5) * 2 * this.inaccuracy;
        this.nextTripDuration = 3 + Math.random() * 7;
    }

    protected moveTank(dt: number) {

        if (this.faceLeft && performance.now() - this.timeLastTurn > this.nextTripDuration) {
            this.startedMovingLeftAt = -1;
            this.startedMovingRightAt = performance.now();
            this.goRight(dt);
            this.timeLastTurn = performance.now();
            this.nextTripDuration = 3000 + Math.random() * 7000;
        } else if (!this.faceLeft && performance.now() - this.timeLastTurn > this.nextTripDuration) {
            this.startedMovingRightAt = -1;
            this.startedMovingLeftAt = performance.now();
            this.goLeft(dt);
            this.timeLastTurn = performance.now();
            this.nextTripDuration = 3000 + Math.random() * 7000;
        } else {
            if (this.faceLeft) {
                this.goLeft(dt);
            } else {
                this.goRight(dt);
            }
        }
        const { originX, originY } = this.getProjectileOrigin();
        if (this.seenTanky || Math.abs(originX - this.tanky.x) < this.gameDimensions.width / 2) {
            this.seenTanky = true;
            const x = this.tanky.x - originX + this.currentInaccuracyX;
            const y = -(this.tanky.y - originY + this.currentInaccuracyY);
            const speedSquared = Math.pow(this.power, 2);
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
                if (this.tanky.x - originX > 0) {
                    targetGunRotation = - angle - this.terrainRotationAngle;
                } else {
                    targetGunRotation = - Math.PI - angle - this.terrainRotationAngle;
                }
                if (this.faceLeft) {
                    targetGunRotation = - Math.PI - targetGunRotation;
                }
                this.gunRotation = this.gunRotation - Math.min(this.gunRotation - targetGunRotation, 20) * dt;
                if (performance.now() - this.lastShot > this.msBetweenShots) {
                    this.fireGun();
                    this.lastShot = performance.now();
                    this.currentInaccuracyX = (Math.random() - 0.5) * 2 * this.inaccuracy;
                    this.currentInaccuracyY = (Math.random() - 0.5) * 2 * this.inaccuracy;
                }
            }
        }
    }

    protected getTurretColor() {
        let turretColor = "green";
        if (this.tanky.health < this.damage) {
            turretColor = "red";
        } else if (this.tanky.health / 2 < this.damage) {
            turretColor = "orange";
        }
        return turretColor;
    }

}
