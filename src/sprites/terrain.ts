import { GameDimensions } from "../dimensions";
import { emit, getContext, Vector } from "../kontra/kontra";

class HeightEntry {
    public height: number;
    public readonly originalHeight: number;
    public exploded = false;
    constructor(height: number) {
        this.height = height;
        this.originalHeight = height;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class Terrain extends Vector {

    public sectorWidth: number;
    private heightMapsPos: HeightEntry[][];
    private heightMapsNeg: HeightEntry[][];
    private offset = 0;
    private gameDimensions: GameDimensions;

    constructor(gameDimensions: GameDimensions) {
        super();
        this.sectorWidth = gameDimensions.width;
        this.gameDimensions = gameDimensions;
        this.heightMapsPos = [this.generateHeightMap()];
        this.heightMapsNeg = [];
    }

    public generateHeightMap(leftHeight?: number): HeightEntry[] {
        if (!leftHeight) {
            leftHeight = Math.random() * 100;
        }
        const rightHeight = Math.random() * 100;
        const heightMap: HeightEntry[] = new Array(this.sectorWidth);
        heightMap[0] = new HeightEntry(leftHeight);
        heightMap[this.sectorWidth - 1] = new HeightEntry(rightHeight);
        this.midpointDisplacement(heightMap, 0, this.sectorWidth - 1);
        return heightMap;
    }

    public midpointDisplacement(heightMap: HeightEntry[], leftIdx: number, rightIdx: number) {
        const leftHeight = heightMap[leftIdx].height;
        const rightHeight = heightMap[rightIdx].height;
        const midHeight = leftHeight - ((leftHeight - rightHeight) / 2);
        if (rightIdx - leftIdx < 4) {
            for (let index = leftIdx + 1; index < rightIdx; index++) {
                heightMap[index] = new HeightEntry(midHeight);
            }
        } else {
            const distance = Math.abs(leftIdx - rightIdx);
            const jitter = (Math.random() - 0.5) * (distance / 6);
            const midIdx = Math.round(leftIdx + ((rightIdx - leftIdx) / 2));
            let newHeight = midHeight + jitter;
            newHeight = Math.min(newHeight, 100);
            newHeight = Math.max(newHeight, 0);
            heightMap[midIdx] = new HeightEntry(newHeight);
            this.midpointDisplacement(heightMap, leftIdx, midIdx);
            this.midpointDisplacement(heightMap, midIdx, rightIdx);
        }

    }

    public render() {
        const context = getContext();
        context.fillStyle = "#663300";
        context.beginPath();
        context.moveTo(0, this.gameDimensions.height);
        for (let index = 0; index < this.gameDimensions.width + 1; index++) {
            const height = this.getGlobalHeight(index);
            context.lineTo(index, height);
        }
        context.lineTo(this.gameDimensions.width, this.gameDimensions.height);
        context.fill();

        context.beginPath();
        context.strokeStyle = "#006400";
        context.lineWidth = 4;
        context.moveTo(0, this.getGlobalHeight(0) - 1);
        let explodeMode = false;
        for (let index = 0; index < this.gameDimensions.width; index++) {
            if (!explodeMode && this.hasExploded(index)) {
                explodeMode = true;
                context.stroke();
                context.beginPath();
                context.strokeStyle = "black";
            } else if (explodeMode && !this.hasExploded(index)) {
                explodeMode = false;
                context.stroke();
                context.beginPath();
                context.strokeStyle = "#006400";
            }
            const height = this.getGlobalHeight(index) - 1;
            context.lineTo(index, height);
        }
        context.stroke();
    }

    public getGlobalHeight(x: number, applyOffset = true, originalHeight = false): number {
        return this.gameDimensions.height - this.gameDimensions.height / 5 -
            this.gameDimensions.height / 3 * (this.getHeight(x, applyOffset, originalHeight) / 100);
    }

    public scroll(offset: number) {
        this.offset = this.offset + offset;
        emit("scroll", offset);
    }

    public explosion(x: number) {
        const height = this.getHeight(x);
        for (let idx = x - 30; idx < x + 31; idx++) {
            const newHeight = height - (3 - 0.05 * Math.abs(idx - x) * Math.abs(idx - x));
            if (newHeight < this.getHeight(idx)) {
                this.changeHeight(idx, newHeight);
            }
        }
    }

    private getHeightMapAndIndex(x: number, applyOffset = true) {
        let offSet = 0;
        if (applyOffset) {
            offSet = this.offset;
        }
        const xWithOffset = Math.round(x) + offSet;
        let heightMap: HeightEntry[];
        const remainder = xWithOffset % this.sectorWidth;
        if (xWithOffset < 0) {
            const heightMapIdx = Math.abs(Math.ceil(xWithOffset / this.sectorWidth));
            while (heightMapIdx >= this.heightMapsNeg.length) {
                let startHeight: number;
                if (this.heightMapsNeg.length < 1) {
                    const leftMostHeightMap = this.heightMapsPos[0];
                    startHeight = leftMostHeightMap[0].height;
                } else {
                    const leftMostHeightMap = this.heightMapsNeg[this.heightMapsNeg.length - 1];
                    startHeight = leftMostHeightMap[leftMostHeightMap.length - 1].height;
                }
                this.heightMapsNeg.push(this.generateHeightMap(startHeight));
                const startOfArea = this.heightMapsNeg.length * - this.sectorWidth;
                emit("newTerrain", startOfArea, startOfArea + this.sectorWidth - 1, this.offset);
            }
            heightMap = this.heightMapsNeg[heightMapIdx];
        } else {
            const heightMapIdx = Math.floor(xWithOffset / this.sectorWidth);
            while (heightMapIdx >= this.heightMapsPos.length) {
                const rightMostHeightMap = this.heightMapsPos[this.heightMapsPos.length - 1];
                const height = rightMostHeightMap[rightMostHeightMap.length - 1].height;
                this.heightMapsPos.push(this.generateHeightMap(height));
                const startOfArea = (this.heightMapsPos.length - 1) * this.sectorWidth;
                emit("newTerrain", startOfArea, startOfArea + this.sectorWidth - 1, this.offset);
            }
            heightMap = this.heightMapsPos[heightMapIdx];
        }
        const idx = Math.abs(remainder);
        return { heightMap, idx };
    }

    private changeHeight(x: number, newHeight: number) {
        const { heightMap, idx }: { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x);
        heightMap[idx].height = Math.max(newHeight, 0);
        heightMap[idx].exploded = true;
    }

    private getHeight(x: number, applyOffset = true, originalHeight = false): number {
        const { heightMap, idx }:
            { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x, applyOffset);
        if (originalHeight) {
            return heightMap[idx].originalHeight;
        }
        return heightMap[idx].height;
    }

    private hasExploded(x: number): boolean {
        const { heightMap, idx }: { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x);
        return heightMap[idx].exploded;
    }

}
