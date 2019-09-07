// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import { GameDimensions } from "./dimensions";
import { start } from "./game";

const gameDimensions = new GameDimensions();

export function resizeIfNeeded() {
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

const startButton = document.getElementById("startbutton")!;
startButton.addEventListener("click", (_) => {
    start(gameDimensions);
    const gameMenu = document.getElementById("gameMenu")!;
    gameMenu.hidden = true;
});
