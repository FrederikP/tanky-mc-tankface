// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import * as kontra from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Tank } from "../src/sprites/tank";
import { Terrain } from "../src/sprites/terrain";

const { canvas, context } = kontra.init();

const terrain = new Terrain(0, 768, 1366, 50, 400);
const tank = new Tank(50, 600, terrain);

let projectiles: Projectile[] = [];

kontra.initKeys();

function spawnProjectile(x: number, y: number, direction: number) {
    projectiles.push(new Projectile(x, y, direction, 80));
}

kontra.on("spawnProjectile", spawnProjectile);

const loop = kontra.GameLoop({  // create the main game loop
    render: function render() { // render the game state
        terrain.render();
        projectiles.forEach((projectile) => {
            projectile.render();
        });
        tank.render();
    },
    update: function update(dt: number) { // update the game state
        terrain.update();
        projectiles.forEach((projectile) => {
            projectile.update();
        });
        tank.update(dt);
    },
});

loop.start();    // start the game
