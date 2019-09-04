// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import {emit, GameLoop, init, initKeys, on} from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Tank } from "../src/sprites/tank";
import { Terrain } from "../src/sprites/terrain";
import { Turret } from "../src/sprites/turret";
import { GameDimensions } from "./dimensions";
import { Score } from "./score";
import { Background } from "./sprites/background";
import { DamageItem } from "./sprites/damageitem";
import { Effect } from "./sprites/effect";
import { Enemy } from "./sprites/enemy";
import { HealthItem } from "./sprites/healthitem";
import { HUD } from "./sprites/hud";
import { Item } from "./sprites/item";
import { MuzzleFlash } from "./sprites/muzzleflash";
import { ProjectileItem } from "./sprites/projectileitem";
import { SpeedItem } from "./sprites/speeditem";
import { TextLayer } from "./sprites/textlayer";

init();

let background: Background;
let textLayer: TextLayer;
let terrain: Terrain;
let tank: Tank;
let hud: HUD;
let enemies: Enemy[];
let projectiles: Projectile[];
let score: Score;
let items: Item[];
let pickedUpItems: Item[];
let effects: Effect[];

const gameDimensions = new GameDimensions();

function startRun(highScore: number, itemsToApply: Item[]) {
    background = new Background(gameDimensions);
    textLayer = new TextLayer(gameDimensions);
    terrain = new Terrain(gameDimensions);
    tank = new Tank(gameDimensions.width / 2, -30, gameDimensions, terrain);

    itemsToApply.forEach((item) => {
        item.apply(tank);
    });

    score = new Score(highScore);
    hud = new HUD(tank, score, gameDimensions);

    projectiles = [];
    enemies = [];
    items = [];
    pickedUpItems = [];
    effects = [];
}

initKeys();

function spawnProjectile(x: number, y: number, direction: number, v0: number, damage: number) {
    projectiles.push(new Projectile(x, y, direction, v0, damage));
    effects.push(new MuzzleFlash(x, y, direction));
}

on("spawnProjectile", spawnProjectile);

function newTerrain(leftIdx: number, rightIdx: number, currentOffset: number) {
    const difficultyFactor = Math.abs(leftIdx / terrain.sectorWidth);
    const numberOfTurrets = Math.max(3, Math.round(difficultyFactor * 2 * Math.random()));
    const scaleFactor = Math.pow(difficultyFactor, 2) * 3;
    for (let turretIdx = 0; turretIdx < numberOfTurrets; turretIdx++) {
        const index = leftIdx + Math.random() * (rightIdx - leftIdx - 40);
        const shootDirectly = difficultyFactor * Math.random() > 2 && Math.random() > 0.3;
        const inaccuracy = Math.max(1, 80 - scaleFactor * Math.random());
        const msBetweenShots = Math.max(100, 4000 - scaleFactor * Math.random());
        const shootingSpeed = 100 + (Math.random() - 0.5) * 40;
        const maxHealth = Math.round(1 + Math.random() * 0.2 * scaleFactor);
        const damage = maxHealth / 3;
        const points = Math.round(((80 / inaccuracy) * (4000 / msBetweenShots) * shootingSpeed *
                       maxHealth * damage * (shootDirectly ? 5 : 1)) / Math.log2(difficultyFactor + 1));
        enemies.push(new Turret(index - currentOffset, tank, shootingSpeed,
                                msBetweenShots, shootDirectly, inaccuracy, maxHealth,
                                damage, points, gameDimensions, terrain));
    }
}

on("newTerrain", newTerrain);

function enemyKilled(enemy: Enemy) {
    score.addPoints(enemy.points);
    const rand = Math.random() * 100;
    if (rand < 10) {
        items.push(new ProjectileItem(enemy.x, enemy.y));
    } else if (rand < 25) {
        items.push(new DamageItem(enemy.x, enemy.y));
    } else if (rand < 45) {
        items.push(new SpeedItem(enemy.x, enemy.y));
    } else if (rand < 70) {
        items.push(new HealthItem(enemy.x, enemy.y));
    }
}

on("enemyKilled", enemyKilled);

function resizeIfNeeded() {
    const gameArea = document.getElementById("gameArea")!;
    const widthToHeight = 16 / 9;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    const newWidthToHeight = newWidth / newHeight;
    if (newWidthToHeight > widthToHeight) {
        // window width is too wide relative to desired game width
        newWidth = Math.round(newHeight * widthToHeight);
        gameArea.style.height = newHeight + "px";
        gameArea.style.width = newWidth + "px";
    } else { // window height is too high relative to desired game height
        newHeight = Math.round(newWidth / widthToHeight);
        gameArea.style.width = newWidth + "px";
        gameArea.style.height = newHeight + "px";
    }
    gameArea.style.marginTop = (-newHeight / 2) + "px";
    gameArea.style.marginLeft = (-newWidth / 2) + "px";
    gameArea.style.fontSize = (newWidth / 1000) + "em";

    const gameCanvas = document.getElementById("gameCanvas")! as HTMLCanvasElement;
    gameCanvas.width = newWidth;
    gameCanvas.height = newHeight;
    gameDimensions.width = newWidth;
    gameDimensions.height = newHeight;
}

window.addEventListener("resize", resizeIfNeeded, false);
window.addEventListener("orientationchange", resizeIfNeeded, false);

resizeIfNeeded();

const loop = GameLoop({  // create the main game loop
    render: function render() { // render the game state
        resizeIfNeeded();
        background.render();
        textLayer.render();
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
        effects.forEach((effect) => {
            effect.render();
        });
        hud.render();
    },
    update: function update(dt: number) { // update the game state
        terrain.update();
        enemies.forEach((enemy) => {
            enemy.update(dt);
        });

        const effectIdsToRemove = [];
        for (let index = 0; index < effects.length; index++) {
            const effect = effects[index];
            if (effect.effectDone()) {
                effectIdsToRemove.push(index);
            }
        }
        for (let i = effectIdsToRemove.length - 1; i >= 0; i--) {
            effects.splice(effectIdsToRemove[i], 1);
        }

        const itemIdsToRemove = [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (Math.abs(tank.x - item.x) < tank.width / 2) {
                itemIdsToRemove.push(index);
                tank.pickUp(item);
                pickedUpItems.push(item);
                const itemsAsNames = pickedUpItems.map((pickedUpItem) => pickedUpItem.name);
                localStorage.setItem("tankymctankface_items", JSON.stringify(itemsAsNames));
            }
        }
        for (let i = itemIdsToRemove.length - 1; i >= 0; i--) {
            items.splice(itemIdsToRemove[i], 1);
        }
        const projectileIdsToRemove = [];
        const enemyIdsToRemoveSet: Set<number> = new Set();
        for (let index = 0; index < projectiles.length; index++) {
            let removeProjectile = false;
            const projectile = projectiles[index];
            projectile.update();
            for (let enemyIdx = 0; enemyIdx < enemies.length; enemyIdx++) {
                const enemy = enemies[enemyIdx];
                if (Math.abs(projectile.x - enemy.x) < 50) {
                    if (enemy.collidesWith(projectile)) {
                        removeProjectile = true;
                        enemy.takeDamage(projectile);
                        if (enemy.isDead()) {
                            if (!enemyIdsToRemoveSet.has(enemyIdx)) {
                                enemyIdsToRemoveSet.add(enemyIdx);
                                emit("enemyKilled", enemy);
                            }
                        }
                    }
                }
            }
            const terrainHeight = terrain.getGlobalHeight(projectile.x);
            if (projectile.y >= terrainHeight) {
                terrain.explosion(projectile.x);
                removeProjectile = true;
            }
            if (Math.abs(projectile.x - tank.x) < 50) {
                if (tank.collidesWith(projectile)) {
                    tank.takeDamage(projectile);
                    removeProjectile = true;
                    if (tank.isDead()) {
                        startRun(score.getHighscore(), tank.getPickedUpItems());
                    }
                }
            }
            if (removeProjectile) {
                projectileIdsToRemove.push(index);
            }
        }
        for (let i = projectileIdsToRemove.length - 1; i >= 0; i--) {
            projectiles.splice(projectileIdsToRemove[i], 1);
        }
        const enemyIdsToRemove: number[] = Array.from(enemyIdsToRemoveSet).sort((a, b) => a - b);
        for (let i = enemyIdsToRemove.length - 1; i >= 0; i--) {
            enemies.splice(enemyIdsToRemove[i], 1);
        }
        tank.update(dt);
    },
});
const itemNames = localStorage.getItem("tankymctankface_items");
const oldItems: Item[] = [];

const availableItems: Record<string, Item> = {};

const projItem = new ProjectileItem(0, 0);
availableItems[projItem.name] = projItem;
const speedItem = new SpeedItem(0, 0);
availableItems[speedItem.name] = speedItem;
const damageItem = new DamageItem(0, 0);
availableItems[damageItem.name] = damageItem;
const healthItem = new HealthItem(0, 0);
availableItems[healthItem.name] = healthItem;

if (itemNames) {
    const parsedItemNames: string[] = JSON.parse(itemNames);
    parsedItemNames.forEach((parsedItemName) => {
        oldItems.push(availableItems[parsedItemName]);
    });
}

startRun(Number(localStorage.getItem("tankymctankface_highscore")), oldItems);
loop.start();    // start the game
