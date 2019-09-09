import { emit, GameLoop, init, initKeys, on } from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Terrain } from "../src/sprites/terrain";
import { Turret } from "../src/sprites/turret";
import { GameDimensions } from "./dimensions";
import { resizeIfNeeded } from "./main";
import { Score } from "./score";
import { backgroundMusicData } from "./sounds/background";
import { explosionSoundData } from "./sounds/explosion";
import { itemSoundData } from "./sounds/itempickup";
import { shotSoundData } from "./sounds/shot";
import { Sound } from "./sounds/sound";
import { SoundSettings } from "./sounds/soundsettings";
import { Background } from "./sprites/background";
import { BlowupParticle } from "./sprites/blowupparticle";
import { DamageItem } from "./sprites/damageitem";
import { Effect } from "./sprites/effect";
import { EnemyTank } from "./sprites/enemytank";
import { HealthItem } from "./sprites/healthitem";
import { HUD } from "./sprites/hud";
import { Item } from "./sprites/item";
import { Machine } from "./sprites/machine";
import { MuzzleFlash } from "./sprites/muzzleflash";
import { ProjectileItem } from "./sprites/projectileitem";
import { ReloadTimeItem } from "./sprites/reloadtimeitem";
import { SpeedItem } from "./sprites/speeditem";
import { Tanky } from "./sprites/tanky";
import { TextLayer } from "./sprites/textlayer";

export class TankyGame {

    private background: Background;
    private textLayer: TextLayer;
    private terrain: Terrain;
    private tanky: Tanky;
    private hud: HUD;
    private enemies: Machine[];
    private projectiles: Projectile[];
    private score: Score;
    private items: Item[];
    private pickedUpItems: Item[];
    private effects: Effect[];
    private gameDimensions: GameDimensions;
    private shotSound: Sound;
    private explosionSound: Sound;
    private itemSound: Sound;
    private loop: any;
    private backgroundSong: Sound;
    private numberOfActiveItems: number;

    private hasStarted = false;

    public constructor(gameDimensions: GameDimensions, initialItems: Item[], soundSettings: SoundSettings) {
        init();
        initKeys();
        this.numberOfActiveItems = initialItems.length;
        this.backgroundSong = new Sound(backgroundMusicData, soundSettings, true, true);

        this.shotSound = new Sound(shotSoundData, soundSettings);
        this.explosionSound = new Sound(explosionSoundData, soundSettings);
        this.itemSound = new Sound(itemSoundData, soundSettings);

        this.gameDimensions = gameDimensions;

        on("spawnProjectile", (x: number, y: number, direction: number,
                               v0: number, damage: number) =>
            this.spawnProjectile(x, y, direction, v0, damage));
        on("newTerrain", (leftIdx: number, rightIdx: number, currentOffset: number) =>
            this.newTerrain(leftIdx, rightIdx, currentOffset));
        on("enemyKilled", (enemy: Machine) => this.enemyKilled(enemy));

        this.effects = [];
        this.background = new Background(this.gameDimensions);
        this.textLayer = new TextLayer(this.gameDimensions);
        this.terrain = new Terrain(this.gameDimensions);
        this.tanky = new Tanky(this.gameDimensions.width / 2, this.gameDimensions, this.terrain, this.effects);
        initialItems.forEach((item) => {
            item.apply(this.tanky);
        });

        this.score = new Score(Number(localStorage.getItem("tankymctankface_highscore")));
        this.hud = new HUD(this.tanky, this.score, this.gameDimensions);

        this.projectiles = [];
        this.enemies = [];
        this.items = [];
        this.pickedUpItems = [];

        this.loop = GameLoop({
            render: () => this.render(),
            update: (dt: number) => this.update(dt),
        });
    }

    public start() {
        this.backgroundSong.play();
        this.loop.start();
        this.hasStarted = true;
    }

    public started() {
        return this.hasStarted;
    }

    public stop() {
        this.backgroundSong.pause();
        this.loop.stop();
    }

    private render() { // render the game state
        resizeIfNeeded();
        this.background.render();
        this.textLayer.render();
        this.enemies.forEach((enemy) => {
            if (enemy.x > -40 && enemy.x < this.gameDimensions.width + 40) {
                enemy.render();
            }
        });
        this.projectiles.forEach((projectile) => {
            if (projectile.x > -2 && projectile.x < this.gameDimensions.width + 2) {
                projectile.render();
            }
        });
        this.tanky.render();
        this.items.forEach((item) => {
            if (item.x > -20 && item.x < this.gameDimensions.width + 20) {
                item.render();
            }
        });
        this.effects.forEach((effect) => {
            if (effect.x > -5 && effect.x < this.gameDimensions.width + 5) {
                effect.render();
            }
        });
        this.terrain.render();
        this.hud.render();
    }

    private update(dt: number) { // update the game state
        this.terrain.update();
        this.enemies.forEach((enemy) => {
            enemy.update(dt);
        });

        const effectIdsToRemove = [];
        for (let index = 0; index < this.effects.length; index++) {
            const effect = this.effects[index];
            if (effect.effectDone()) {
                effectIdsToRemove.push(index);
            }
        }
        for (let i = effectIdsToRemove.length - 1; i >= 0; i--) {
            this.effects.splice(effectIdsToRemove[i], 1);
        }

        const itemIdsToRemove = [];
        for (let index = 0; index < this.items.length; index++) {
            const item = this.items[index];
            if (Math.abs(this.tanky.x - item.x) < this.tanky.width / 2) {
                itemIdsToRemove.push(index);
                this.tanky.pickUp(item);
                this.pickedUpItems.push(item);
                this.itemSound.play();
                const itemsAsNames = this.pickedUpItems.map((pickedUpItem) => pickedUpItem.name);
                localStorage.setItem("tankymctankface_items", JSON.stringify(itemsAsNames));
            }
        }
        for (let i = itemIdsToRemove.length - 1; i >= 0; i--) {
            this.items.splice(itemIdsToRemove[i], 1);
        }
        const projectileIdsToRemove = [];
        const enemyIdsToRemoveSet: Set<number> = new Set();
        for (let index = 0; index < this.projectiles.length; index++) {
            let removeProjectile = false;
            const projectile = this.projectiles[index];
            projectile.update();
            for (let enemyIdx = 0; enemyIdx < this.enemies.length; enemyIdx++) {
                const enemy = this.enemies[enemyIdx];
                if (Math.abs(projectile.x - enemy.x) < 50) {
                    if (enemy.collidesWith(projectile)) {
                        removeProjectile = true;
                        this.blowUpParticles(projectile);
                        this.explosionSound.play();
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
            const terrainHeight = this.terrain.getGlobalHeight(projectile.x);
            if (projectile.y >= terrainHeight) {
                this.terrain.explosion(projectile.x);
                removeProjectile = true;
                this.blowUpParticles(projectile);
                this.explosionSound.play();
            }
            if (Math.abs(projectile.x - this.tanky.x) < 50) {
                if (this.tanky.collidesWith(projectile)) {
                    this.tanky.takeDamage(projectile);
                    removeProjectile = true;
                    this.blowUpParticles(projectile);
                    this.explosionSound.play();
                    if (this.tanky.isDead()) {
                        this.restartRun(this.score.getHighscore(), this.tanky.getPickedUpItems());
                    }
                }
            }
            if (removeProjectile) {
                projectileIdsToRemove.push(index);
            }
        }
        for (let i = projectileIdsToRemove.length - 1; i >= 0; i--) {
            this.projectiles.splice(projectileIdsToRemove[i], 1);
        }
        const enemyIdsToRemove: number[] = Array.from(enemyIdsToRemoveSet).sort((a, b) => a - b);
        for (let i = enemyIdsToRemove.length - 1; i >= 0; i--) {
            this.enemies.splice(enemyIdsToRemove[i], 1);
        }
        this.tanky.update(dt);
    }

    private restartRun(highScore: number, itemsToApply: Item[]) {
        this.numberOfActiveItems = itemsToApply.length;
        this.effects = [];
        this.background = new Background(this.gameDimensions);
        this.textLayer = new TextLayer(this.gameDimensions);
        this.terrain = new Terrain(this.gameDimensions);
        this.tanky = new Tanky(this.gameDimensions.width / 2, this.gameDimensions, this.terrain, this.effects);

        itemsToApply.forEach((item) => {
            item.apply(this.tanky);
        });

        this.score = new Score(highScore);
        this.hud = new HUD(this.tanky, this.score, this.gameDimensions);

        this.projectiles = [];
        this.enemies = [];
        this.items = [];
        this.pickedUpItems = [];
    }

    private spawnProjectile(x: number, y: number, direction: number, v0: number, damage: number) {
        this.projectiles.push(new Projectile(x, y, direction, v0, damage));
        this.effects.push(new MuzzleFlash(x, y, direction));
        this.shotSound.play();
    }

    private newTerrain(leftIdx: number, rightIdx: number, currentOffset: number) {
        const difficultyFactor = Math.abs(leftIdx / 2000) + this.numberOfActiveItems / 3;
        const numberOfTurrets = Math.round((rightIdx - leftIdx) / 300 * Math.random());
        const scaleFactor = Math.pow(difficultyFactor, 2);
        for (let turretIdx = 0; turretIdx < numberOfTurrets; turretIdx++) {
            const { index, shootingSpeed, msBetweenShots, shootDirectly, inaccuracy, maxHealth, damage, points } =
                this.scaleDifficulty(leftIdx, rightIdx, difficultyFactor, scaleFactor);
            this.enemies.push(new Turret(index - currentOffset, this.tanky, shootingSpeed,
                msBetweenShots, shootDirectly, inaccuracy, maxHealth,
                damage, points, this.gameDimensions, this.terrain));
        }
        const numberOfTanks = Math.round((rightIdx - leftIdx) / 600 * Math.random());
        for (let tankIdx = 0; tankIdx < numberOfTanks; tankIdx++) {
            const { index, shootingSpeed, msBetweenShots, shootDirectly, inaccuracy, maxHealth, damage, points } =
                this.scaleDifficulty(leftIdx, rightIdx, difficultyFactor, scaleFactor);
            const tank = new EnemyTank(index - currentOffset, this.gameDimensions, this.terrain, this.effects,
                points, shootingSpeed, msBetweenShots, shootDirectly, inaccuracy, damage,
                this.tanky);
            tank.setInitialHealth(maxHealth);
            this.enemies.push(tank);
        }
    }

    private scaleDifficulty(leftIdx: number, rightIdx: number, difficultyFactor: number, scaleFactor: number) {
        const index = leftIdx + Math.random() * (rightIdx - leftIdx - 40);
        const shootDirectly = difficultyFactor * Math.random() > 2 && Math.random() > 0.3;
        const inaccuracy = Math.max(1, 80 - scaleFactor * Math.random());
        const msBetweenShots = Math.max(100, 4000 - scaleFactor * Math.random());
        const shootingSpeed = 100 + (Math.random() - 0.5) * 40;
        const maxHealth = Math.round(1 + Math.random() * 0.2 * scaleFactor);
        const damage = Math.round(1 + maxHealth / 3);
        const points = Math.round(((80 / inaccuracy) * (4000 / msBetweenShots) * shootingSpeed *
            maxHealth * damage * (shootDirectly ? 5 : 1)) / Math.log2(difficultyFactor + 1));
        return { index, shootingSpeed, msBetweenShots, shootDirectly, inaccuracy, maxHealth, damage, points };
    }

    private enemyKilled(enemy: Machine) {
        this.score.addPoints(enemy.points);
        const rand = Math.random() * 100;
        if (rand < 5) {
            this.items.push(new ProjectileItem(enemy.x, enemy.y));
        } else if (rand < 15) {
            this.items.push(new DamageItem(enemy.x, enemy.y));
        } else if (rand < 25) {
            this.items.push(new SpeedItem(enemy.x, enemy.y));
        } else if (rand < 35) {
            this.items.push(new HealthItem(enemy.x, enemy.y));
        } else if (rand < 45) {
            this.items.push(new ReloadTimeItem(enemy.x, enemy.y));
        }
    }

    private blowUpParticles(projectile: Projectile) {
        for (let bpIdx = 0; bpIdx < 5; bpIdx++) {
            const angle = Math.random() * -Math.PI;
            const v0 = 10 + Math.random() * 20;
            const particle: Effect = new BlowupParticle(projectile.x, projectile.y, angle, v0, "#696969");
            this.effects.push(particle);
        }
    }
}
