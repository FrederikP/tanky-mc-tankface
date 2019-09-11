// Custom minimal typescript port of kontra.js (https://github.com/straker/kontra) for tankymctankface
// see kontra license in the same folder this file lives in.
// changes by Frederik Petersen 2019

// tslint:disable: ban-types

const callbacks: Record<string, Function[]> = {};

export function on(event: string, callback: any) {
    callbacks[event] = callbacks[event] || [];
    callbacks[event].push(callback);
}

export function off(event: string, callback: any) {
    let index;
    // tslint:disable-next-line: no-conditional-assignment
    if (!callbacks[event] || (index = callbacks[event].indexOf(callback)) < 0) {
        return;
    }
    callbacks[event].splice(index, 1);
}

export function emit(event: string, ...args: any) {
    if (!callbacks[event]) {
        return;
    }
    callbacks[event].map((fn: any) => fn(...args));
}

const keyCallbacks: Record<string, Function> = {};
let pressedKeys: Record<string, boolean> = {};

export let keyMap: Record<number, string> = {
    32: "space",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
};

function keydownEventHandler(evt: KeyboardEvent) {
    const key = keyMap[evt.which];
    pressedKeys[key] = true;

    if (keyCallbacks[key]) {
        keyCallbacks[key](evt);
    }
}

function keyupEventHandler(evt: KeyboardEvent) {
    pressedKeys[keyMap[evt.which]] = false;
}

function blurEventHandler() {
    pressedKeys = {};
}

export function initKeys() {
    let i;

    for (i = 0; i < 26; i++) {
        keyMap[65 + i] = (10 + i).toString(36);
    }

    for (i = 0; i < 10; i++) {
        keyMap[48 + i] = "" + i;
    }

    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("blur", blurEventHandler);
}

export function bindKeys(keys: string[], callback: Function) {
    keys.map((key) => keyCallbacks[key] = callback);
}

export function unbindKeys(keys: string[]) {
    keys.map((key) => delete keyCallbacks[key]);
}

export function keyPressed(key: string) {
    return !!pressedKeys[key];
}

let canvasEl: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

export function getCanvas() {
    return canvasEl;
}

export function getContext() {
    return context;
}

export function init() {

    canvasEl = document.querySelector("canvas")! as HTMLCanvasElement;

    context = canvasEl.getContext("2d") as CanvasRenderingContext2D;
    context.imageSmoothingEnabled = false;

    return { canvas: canvasEl, context };
}

export class Vector {
    public x: number;
    public y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

function clear() {
    const canvas = getCanvas();
    getContext().clearRect(0, 0, canvas.width, canvas.height);
}

export default function GameLoop(fps = 60, clearCanvas = true, update: (dt: number) => void, render: () => void) {

    let accumulator = 0;
    const delta = 1E3 / fps;
    const step = 1 / fps;
    // tslint:disable-next-line: no-empty
    const clearFn = clearCanvas ? clear : () => { };
    let last: number;
    let rAF: number;
    let now: number;
    let dt: number;

    function frame() {
        rAF = requestAnimationFrame(frame);

        now = performance.now();
        dt = now - last;
        last = now;

        if (dt > 1E3) {
            return;
        }

        accumulator += dt;

        while (accumulator >= delta) {
            loop.update(step);

            accumulator -= delta;
        }

        clearFn();
        loop.render();
    }

    const loop = {
        isStopped: true,
        render,
        update,
        start() {
            last = performance.now();
            this.isStopped = false;
            requestAnimationFrame(frame);
        },
        stop() {
            this.isStopped = true;
            cancelAnimationFrame(rAF);
        },
    };

    return loop;
}
