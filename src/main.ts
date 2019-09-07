// tslint:disable-next-line: no-var-requires
const css = require("./main.css");

import { GameDimensions } from "./dimensions";
import { TankyGame } from "./game";
import { SoundSettings } from "./sounds/soundsettings";
import { DamageItem } from "./sprites/damageitem";
import { HealthItem } from "./sprites/healthitem";
import { Item } from "./sprites/item";
import { ProjectileItem } from "./sprites/projectileitem";
import { SpeedItem } from "./sprites/speeditem";
import { ReloadTimeItem } from "./sprites/reloadtimeitem";

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

const items = getItemsFromStorage();

const musicSlider = document.getElementById("musicSlider")! as HTMLInputElement;
musicSlider.oninput = (_) => {
    soundSettings.musicVolume = Number(musicSlider.value) / 100;
    localStorage.setItem("tankymctankface_music", musicSlider.value);
};

const fxSlider = document.getElementById("fxSlider")! as HTMLInputElement;
fxSlider.oninput = (_) => {
    soundSettings.fxVolume = Number(fxSlider.value) / 100;
    localStorage.setItem("tankymctankface_fx", fxSlider.value);
};

const soundSettings = new SoundSettings();
const musicVol = localStorage.getItem("tankymctankface_music");
if (musicVol) {
    musicSlider.value = musicVol;
    soundSettings.musicVolume = Number(musicVol) / 100;
} else {
    soundSettings.musicVolume = 0.1;
}
const fxVol = localStorage.getItem("tankymctankface_fx");
if (fxVol) {
    fxSlider.value = fxVol;
    soundSettings.fxVolume = Number(fxVol) / 100;
} else {
    soundSettings.fxVolume = 0.5;
}

let game = new TankyGame(gameDimensions, items, soundSettings);

const startButton = document.getElementById("startbutton")!;
const freshStartButton = document.getElementById("freshstartbutton")!;
const gameMenu = document.getElementById("gameMenu")!;
const freshDiv = document.getElementById("freshdiv")!;
if (items.length < 1) {
    freshDiv.hidden = true;
}
startButton.addEventListener("click", (_) => {
    game.start();
    gameMenu.hidden = true;
});

freshStartButton.addEventListener("click", (_) => {
    localStorage.removeItem("tankymctankface_items");
    game = new TankyGame(gameDimensions, [], soundSettings);
    game.start();
    gameMenu.hidden = true;
});

document.addEventListener("keydown", (event) => {
    const keyName = event.key;
    if (keyName === "Escape") {
        freshDiv.hidden = false;
        startButton.innerHTML = "Continue";
        game.stop();
        gameMenu.hidden = false;
    }
}, false);

function getItemsFromStorage() {
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
    const reloadTimeItem = new ReloadTimeItem(0, 0);
    availableItems[reloadTimeItem.name] = reloadTimeItem;
    if (itemNames) {
        const parsedItemNames: string[] = JSON.parse(itemNames);
        parsedItemNames.forEach((parsedItemName) => {
            oldItems.push(availableItems[parsedItemName]);
        });
    }
    return oldItems;
}
