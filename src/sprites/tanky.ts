import { keyPressed } from "kontra";
import { GameDimensions } from "../dimensions";
import { Effect } from "./effect";
import { Item } from "./item";
import { Tank } from "./tank";
import { Terrain } from "./terrain";

export class Tanky extends Tank {

    private items: Item[] = [];
    private itemLabelCounts: Record<string, number> = {};

    constructor(x: number, gameDimensions: GameDimensions, terrain: Terrain,
                effects: Effect[]) {
        super(x, gameDimensions, terrain, effects);
        this.setInitialHealth(3);
    }

    public reloadRatio() {
        return (Date.now() - this.lastShot) / this.reloadTime;
    }

    public liftGun(dt: number) {
        if (this.gunRotation > ((- Math.PI / 2) + (Math.PI / 10))) {
            this.gunRotation = this.gunRotation - Math.PI * (dt / 5);
        }
    }

    public lowerGun(dt: number) {
        if (this.gunRotation < (0 + Math.PI / 16)) {
            this.gunRotation = this.gunRotation + Math.PI * (dt / 5);
        }
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

    protected moveTank(dt: number) {
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
        const gameWidth = this.gameDimensions.width;
        if (this.x < gameWidth / 2 - 30) {
            this.terrain.scroll(Math.round(this.x - (gameWidth / 2 - 30)));
        }
        if (this.x > gameWidth / 2 + 30) {
            this.terrain.scroll(Math.round(this.x - (gameWidth / 2 + 30)));
        }
    }

    protected getTurretColor() {
        return "silver";
    }

}
