import * as kontra from "kontra";
import { Projectile } from "./projectile";

export abstract class Enemy extends kontra.Sprite.class {
    private maxHealth = 3;
    private health = this.maxHealth;

    constructor(x: number, y: number) {
        super({
            x,
            y,
        });
        kontra.on("scroll", (offset: number) => {
            super.x = this.x - offset;
        });
    }

    public render() {
        const context = this.context;
        context.save();
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