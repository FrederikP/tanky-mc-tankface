// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import * as kontra from "kontra";

import { Projectile } from "../src/sprites/projectile";
import { Tank } from "../src/sprites/tank";
import { Terrain } from "../src/sprites/terrain";

const { canvas, context } = kontra.init();

const tank = new Tank(50, 600);

const terrain = new Terrain(0, 768, 1366, 50, 400);

let projectiles: Projectile[] = [];

kontra.initKeys();

kontra.bindKeys(["space"], function spacePressed(e: any) {
    e.preventDefault();
    tank.fireGun();
});

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
        tank.update();

        // wrap the sprites position when it reaches
        // the edge of the screen
        if (tank.x > canvas.width) {
            tank.x = -tank.width;
        }

        if (kontra.keyPressed("up")) {
            tank.liftGun(dt);
        } else if (kontra.keyPressed("down")) {
            tank.lowerGun(dt);
        }

        if (kontra.keyPressed("right")) {
            tank.goRight(dt);
        } else if (kontra.keyPressed("left")) {
            tank.goLeft(dt);
        }
    },
});

loop.start();    // start the game
