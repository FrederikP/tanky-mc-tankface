// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import * as kontra from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Tank } from "../src/sprites/tank";
import { Terrain } from "../src/sprites/terrain";
import { Turret } from "../src/sprites/turret";
import { Constants } from "./constants";
import { Score } from "./score";
import { Enemy } from "./sprites/enemy";
import { HealthItem } from "./sprites/healthitem";
import { HUD } from "./sprites/hud";
import { Item } from "./sprites/item";
import { SpeedItem } from "./sprites/speeditem";

kontra.init();

let terrain: Terrain;
let tank: Tank;
let hud: HUD;
let enemies: Enemy[];
let projectiles: Projectile[];
let score: Score;
let items: Item[];

function startRun(highScore: number, itemsToApply: Item[]) {
    terrain = new Terrain(0, Constants.CANVAS_HEIGHT, Constants.CANVAS_WIDTH,
                          Constants.MIN_TERRAIN_HEIGHT, Constants.MAX_TERRAIN_HEIGHT);
    tank = new Tank(Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, terrain);

    itemsToApply.forEach((item) => {
        item.apply(tank);
    });

    score = new Score(highScore);
    hud = new HUD(tank, score);

    projectiles = [];
    enemies = [];
    items = [];
}

kontra.initKeys();

function spawnProjectile(x: number, y: number, direction: number, v0: number, damage: number) {
    projectiles.push(new Projectile(x, y, direction, v0, damage));
}

kontra.on("spawnProjectile", spawnProjectile);

function newTerrain(leftIdx: number, rightIdx: number, currentOffset: number) {
    const difficultyFactor = leftIdx / Constants.CANVAS_WIDTH;
    const numberOfTurrets = Math.max(1, Math.round(difficultyFactor * 2 * Math.random()));
    for (let turretIdx = 0; turretIdx < numberOfTurrets; turretIdx++) {
        const index = leftIdx + Math.random() * (rightIdx - leftIdx - 40);
        const height = terrain.getGlobalHeight(index, false) - 20;
        const shootDirectly = difficultyFactor * Math.random() > 2 && Math.random() > 0.3;
        const inaccuracy = Math.max(0, 80 - difficultyFactor * difficultyFactor * Math.random());
        const msBetweenShots = Math.max(20, 4000 - difficultyFactor * difficultyFactor * Math.random());
        const shootingSpeed = 100 + (Math.random() - 0.5) * 40;
        const maxHealth = Math.round(1 + Math.random() * 0.2 * difficultyFactor * difficultyFactor);
        const damage = Math.round(1 + Math.random() * 0.05 * difficultyFactor * difficultyFactor);
        const points = Math.round((80 / inaccuracy) * (4000 / msBetweenShots) * shootingSpeed *
                       maxHealth * damage * (shootDirectly ? 5 : 1));
        enemies.push(new Turret(index - currentOffset, height, tank, shootingSpeed,
                                msBetweenShots, shootDirectly, inaccuracy, maxHealth,
                                damage, points));
    }
}

kontra.on("newTerrain", newTerrain);

function enemyKilled(enemy: Enemy) {
    score.addPoints(enemy.points);
    items.push(new SpeedItem(enemy.x, enemy.y));
}

kontra.on("enemyKilled", enemyKilled);

const loop = kontra.GameLoop({  // create the main game loop
    render: function render() { // render the game state
        enemies.forEach((enemy) => {
            enemy.render();
        });
        projectiles.forEach((projectile) => {
            projectile.render();
        });
        tank.render();
        items.forEach((item) => {
            item.render();
        });
        terrain.render();
        hud.render();
    },
    update: function update(dt: number) { // update the game state
        terrain.update();
        enemies.forEach((enemy) => {
            enemy.update(dt);
        });
        const itemIdsToRemove = [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (Math.abs(tank.x - item.x) < tank.width / 2) {
                itemIdsToRemove.push(index);
                tank.pickUp(item);
            }
        }
        for (let i = itemIdsToRemove.length - 1; i >= 0; i--) {
            items.splice(itemIdsToRemove[i], 1);
        }
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
                            kontra.emit("enemyKilled", enemy);
                        }
                    }
                }
            }
            const terrainHeight = terrain.getGlobalHeight(projectile.x);
            if (projectile.y >= terrainHeight) {
                terrain.explosion(projectile.x);
                remove = true;
            }
            if (Math.abs(projectile.x - tank.x) < 50) {
                if (tank.collidesWith(projectile)) {
                    tank.takeDamage(projectile);
                    remove = true;
                    if (tank.isDead()) {
                        startRun(score.getHighscore(), tank.getPickedUpItems());
                    }
                }
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

startRun(Number(localStorage.getItem("tankymctankface_highscore")), []);
loop.start();    // start the game
