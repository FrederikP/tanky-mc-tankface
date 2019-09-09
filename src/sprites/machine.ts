import { on, Sprite } from "kontra";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export abstract class Machine extends Sprite.class {
    public readonly points: number;

    public maxHealth: number;
    public health: number;
    protected terrain: Terrain;

    private showHealthbar: boolean;

    constructor(x: number, maxHealth: number,  terrain: Terrain, showHealthbar = false, points = 0) {
        super({
            x,
        });
        on("scroll", (offset: number) => {
            super.x = this.x - offset;
        });
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.points = points;
        this.terrain = terrain;
        this.showHealthbar = showHealthbar;
    }

    public render() {
        const context = this.context;
        context.save();
        context.translate(this.x, this.y);
        if (this.showHealthbar) {
            const healthMid = 2 * (this.radius * this.health / this.maxHealth);
            context.fillStyle = "green";
            context.fillRect(-this.radius, -this.radius - 30, healthMid, 5);
            context.fillStyle = "red";
            context.fillRect(-this.radius + healthMid, -this.radius - 30, 2 * this.radius - healthMid, 5);
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

    public abstract collidesWith(projectile: Projectile): boolean;

    protected abstract renderMachine(context: any): void;

    protected abstract updateMachine(dt: number): void;
}
