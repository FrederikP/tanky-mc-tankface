import * as kontra from "kontra";

class HeightEntry {
    public height: number;
    public exploded = false;
    constructor(height: number) {
        this.height = height;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class Terrain extends kontra.Sprite.class {

    private width: number;
    private minHeight: number;
    private maxHeight: number;
    private heightMapsPos: HeightEntry[][];
    private heightMapsNeg: HeightEntry[][];
    private offset = 0;

    constructor(originX: number, originY: number, width: number, minHeight: number, maxHeight: number) {
        super({
            x: originX,
            y: originY,
        });
        this.width = width;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.heightMapsPos = [this.generateHeightMap()];
        this.heightMapsNeg = [];
    }

    public generateHeightMap(leftHeight?: number): HeightEntry[] {
        if (!leftHeight) {
            leftHeight = this.minHeight + Math.round(Math.random() * (this.maxHeight - this.minHeight));
        }
        const rightHeight = this.minHeight + Math.round(Math.random() * (this.maxHeight - this.minHeight));
        const heightMap: HeightEntry[] = new Array(this.width);
        heightMap[0] = new HeightEntry(leftHeight);
        heightMap[this.width - 1] = new HeightEntry(rightHeight);
        this.midpointDisplacement(heightMap, 0, this.width - 1);
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
            const jitter = 0.3 * (Math.random() - 0.5) * Math.abs(leftIdx - rightIdx);
            const midIdx = Math.round(leftIdx + ((rightIdx - leftIdx) / 2));
            let newHeight = midHeight + jitter;
            newHeight = Math.min(newHeight, this.maxHeight);
            newHeight = Math.max(newHeight, this.minHeight);
            heightMap[midIdx] = new HeightEntry(newHeight);
            this.midpointDisplacement(heightMap, leftIdx, midIdx);
            this.midpointDisplacement(heightMap, midIdx, rightIdx);
        }

    }

    public render() {
        const context = this.context;

        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(12, 12, 12, 0, Math.PI * 2, true);
        context.fill();

        context.globalCompositeOperation = "destination-out";

        context.beginPath();
        context.arc(20, 12, 12, 0, Math.PI * 2, true);
        context.fill();

        context.globalCompositeOperation = "source-over";

        context.beginPath();
        for (let index = 0; index < this.width; index++) {
            const height = this.getGlobalHeight(index);
            context.fillStyle = "#663300";
            context.fillRect(this.x + index, height, 1, this.y);
            if (this.hasExploded(index)) {
                context.fillStyle = "black";
            } else {
                context.fillStyle = "#006400";
            }
            context.fillRect(this.x + index, height - 4, 1, 4);
        }
    }

    public getGlobalHeight(x: number, applyOffset = true): number {
        return this.y - this.getHeight(x, applyOffset);
    }

    public scroll(offset: number) {
        this.offset = this.offset + offset;
        kontra.emit("scroll", offset);
    }

    public explosion(x: number) {
        const height = this.getHeight(x);
        for (let idx = x - 30; idx < x + 31; idx++) {
            const newHeight = height - (10 - 0.1 * Math.abs(idx - x) * Math.abs(idx - x));
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
        const remainder = xWithOffset % this.width;
        if (xWithOffset < 0) {
            const heightMapIdx = Math.abs(Math.ceil(xWithOffset / this.width));
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
                const startOfArea = this.heightMapsNeg.length * - 1366;
                kontra.emit("newTerrain", startOfArea, startOfArea + 1365, this.offset);
            }
            heightMap = this.heightMapsNeg[heightMapIdx];
        } else {
            const heightMapIdx = Math.floor(xWithOffset / this.width);
            while (heightMapIdx >= this.heightMapsPos.length) {
                const rightMostHeightMap = this.heightMapsPos[this.heightMapsPos.length - 1];
                const height = rightMostHeightMap[rightMostHeightMap.length - 1].height;
                this.heightMapsPos.push(this.generateHeightMap(height));
                const startOfArea = (this.heightMapsPos.length - 1) * 1366;
                kontra.emit("newTerrain", startOfArea, startOfArea + 1365, this.offset);
            }
            heightMap = this.heightMapsPos[heightMapIdx];
        }
        const idx = Math.abs(remainder);
        return { heightMap, idx };
    }

    private changeHeight(x: number, newHeight: number) {
        const { heightMap, idx }: { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x);
        heightMap[idx].height = Math.max(newHeight, this.minHeight);
        heightMap[idx].exploded = true;
    }

    private getHeight(x: number, applyOffset = true): number {
        const { heightMap, idx }:
            { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x, applyOffset);
        return heightMap[idx].height;
    }

    private hasExploded(x: number): boolean {
        const { heightMap, idx }: { heightMap: HeightEntry[]; idx: number; } = this.getHeightMapAndIndex(x);
        return heightMap[idx].exploded;
    }

}
