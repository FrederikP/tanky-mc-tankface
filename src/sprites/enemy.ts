import { on, Sprite } from "kontra";
import { Projectile } from "./projectile";
import { Terrain } from "./terrain";

export abstract class Enemy extends Sprite.class {
    public readonly points: number;

    private maxHealth: number;
    private health: number;
    private terrain: Terrain;

    constructor(x: number, maxHealth: number, points: number, terrain: Terrain) {
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
    }

    public render() {
        const context = this.context;
        context.save();
        super.y = this.terrain.getGlobalHeight(this.x, true, true) - 20;
        context.translate(this.x, this.y);
        context.beginPath();

        const healthMid = 2 * (this.radius * this.health / this.maxHealth);
        context.fillStyle = "green";
        context.fillRect(-this.radius, -this.radius - 30, healthMid, 5);
        context.fillStyle = "red";
        context.fillRect(-this.radius + healthMid, -this.radius - 30, 2 * this.radius - healthMid, 5);
        this.renderEnemy(context);
        context.restore();

    }

    public update(dt: number) {
        this.updateEnemy(dt);
    }

    public takeDamage(projectile: Projectile) {
        this.health = this.health - projectile.damage;
    }

    public isDead(): boolean {
        return this.health <= 0;
    }

    public abstract collidesWith(projectile: Projectile): boolean;

    protected abstract renderEnemy(context: any): void;

    protected abstract updateEnemy(dt: number): void;
}
