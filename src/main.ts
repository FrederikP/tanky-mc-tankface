// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import * as kontra from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Tank } from "../src/sprites/tank";
import { Terrain } from "../src/sprites/terrain";
import { Turret } from "../src/sprites/turret";
import { Enemy } from "./sprites/enemy";

const { canvas, context } = kontra.init();

const terrain = new Terrain(0, 768, 1366, 50, 400);
const tank = new Tank(1366 / 2, 600, terrain);

const projectiles: Projectile[] = [];
const enemies: Enemy[] = [];
enemies.push(new Turret(1600, terrain.getGlobalHeight(1600) - 20, tank));

kontra.initKeys();

function spawnProjectile(x: number, y: number, direction: number, v0: number) {
    projectiles.push(new Projectile(x, y, direction, v0));
}

kontra.on("spawnProjectile", spawnProjectile);

const loop = kontra.GameLoop({  // create the main game loop
    render: function render() { // render the game state
        enemies.forEach((enemy) => {
            enemy.render();
        });
        projectiles.forEach((projectile) => {
            projectile.render();
        });
        tank.render();
        terrain.render();
    },
    update: function update(dt: number) { // update the game state
        terrain.update();
        enemies.forEach((enemy) => {
            enemy.update(dt);
        });
        const projectileIdsToRemove = [];
        const enemyIdsToRemove = [];
        for (let index = 0; index < projectiles.length; index++) {
            let remove = false;
            const projectile = projectiles[index];
            projectile.update();
            for (let enemyIdx = 0; enemyIdx < enemies.length; enemyIdx++) {
                const enemy = enemies[enemyIdx];
                if (Math.abs(projectile.x - enemy.x) < 50) {
                    if (enemy.collidesWith(projectile)) {
                        remove = true;
                        projectileIdsToRemove.push(index);
                        enemy.takeDamage(projectile);
                        if (enemy.isDead()) {
                            enemyIdsToRemove.push(enemyIdx);
                        }
                    }
                }
            }
            const terrainHeight = terrain.getGlobalHeight(projectile.x);
            if (projectile.y >= terrainHeight) {
                terrain.explosion(projectile.x);
                remove = true;
            }
            if (remove) {
                projectileIdsToRemove.push(index);
            }
        }
        for (let i = projectileIdsToRemove.length - 1; i >= 0; i--) {
            projectiles.splice(projectileIdsToRemove[i], 1);
        }
        for (let i = enemyIdsToRemove.length - 1; i >= 0; i--) {
            enemies.splice(enemyIdsToRemove[i], 1);
        }
        tank.update(dt);
    },
});

loop.start();    // start the game
