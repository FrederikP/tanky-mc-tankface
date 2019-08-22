// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import * as kontra from "kontra";

import { Tank } from "../src/sprites/tank";

const { canvas, context } = kontra.init();

const tank = new Tank(50, 600);

const loop = kontra.GameLoop({  // create the main game loop
    render: function render() { // render the game state
        tank.render();
    },
    update: function update() { // update the game state
        tank.update();

        // wrap the sprites position when it reaches
        // the edge of the screen
        if (tank.x > canvas.width) {
            tank.x = -tank.width;
        }
    },
});

loop.start();    // start the game
