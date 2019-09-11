import { getContext, Vector } from "../kontra/kontra";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export abstract class Machine extends Vector {
    public readonly points: number;

    public maxHealth: number;
    public health: number;
    protected terrain: Terrain;

    private showHealthbar: boolean;

    constructor(x: number, maxHealth: number,  terrain: Terrain, showHealthbar = false, points = 0) {
        super(x);
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.points = points;
        this.terrain = terrain;
        this.showHealthbar = showHealthbar;
    }

    public render() {
        const context = getContext();
        context.save();
        context.translate(this.x, this.y);
        if (this.showHealthbar) {
            const healthMid = 2 * (30 * this.health / this.maxHealth);
            context.fillStyle = "green";
            context.fillRect(-30, -30, healthMid, 5);
            context.fillStyle = "red";
            context.fillRect(-30 + healthMid, -30, 60 - healthMid, 5);
        }

        this.renderMachine(context);
        context.restore();

    }

    public update(dt: number) {
        this.updateMachine(dt);
    }

    public takeDamage(projectile: Projectile) {
        this.health = this.health - projectile.damage;
    }

    public isDead(): boolean {
        return this.health <= 0;
    }

    public scroll(offset: number) {
        super.x = this.x - offset;
    }

    public abstract collidesWith(projectile: Projectile): boolean;

    protected abstract renderMachine(context: CanvasRenderingContext2D): void;

    protected abstract updateMachine(dt: number): void;
}
