import { GameDimensions } from "../dimensions";
import { Effect } from "./effect";
import { Tank } from "./tank";
import { Terrain } from "./terrain";

export class EnemyTank extends Tank {

    private timeLastTurn = Date.now();

    constructor(x: number, gameDimensions: GameDimensions, terrain: Terrain,
                effects: Effect[], points: number) {
        super(x, gameDimensions, terrain, effects, true, points);
        this.power = 80;
    }

    public moveTank(dt: number) {
        if (!this.isReloading()) {
            this.fireGun();
            this.lastShot = Date.now();
        }

        if (this.faceLeft && Date.now() - this.timeLastTurn > 10000) {
            this.startedMovingLeftAt = -1;
            this.startedMovingRightAt = Date.now();
            this.goRight(dt);
            this.timeLastTurn = Date.now();
        } else if (!this.faceLeft && Date.now() - this.timeLastTurn > 10000) {
            this.startedMovingRightAt = -1;
            this.startedMovingLeftAt = Date.now();
            this.goLeft(dt);
            this.timeLastTurn = Date.now();
        } else {
            if (this.faceLeft) {
                this.goLeft(dt);
            } else {
                this.goRight(dt);
            }
        }
    }

}
