import * as kontra from "kontra";

export class Terrain extends kontra.Sprite.class {

    private width: number;
    private minHeight: number;
    private maxHeight: number;
    private heightMap: number[];

    constructor(originX: number, originY: number, width: number, minHeight: number, maxHeight: number) {
        super({
            x: originX,
            y: originY,
        });
        this.width = width;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.heightMap = this.generateHeightMap();
    }

    public generateHeightMap(): number[] {
        const leftHeight = this.minHeight + Math.round(Math.random() * (this.maxHeight - this.minHeight));
        const rightHeight = this.minHeight + Math.round(Math.random() * (this.maxHeight - this.minHeight));
        const heightMap = new Array(this.width);
        heightMap[0] = leftHeight;
        heightMap[this.width - 1] = rightHeight;
        this.midpointDisplacement(heightMap, 0, this.width - 1);
        return heightMap;
    }

    public midpointDisplacement(heightMap: number[], leftIdx: number, rightIdx: number) {
        const leftHeight = heightMap[leftIdx];
        const rightHeight = heightMap[rightIdx];
        const midHeight = leftHeight - ((leftHeight - rightHeight) / 2);
        if (rightIdx - leftIdx < 4) {
            for (let index = leftIdx + 1; index < rightIdx; index++) {
                heightMap[index] = midHeight;
            }
        } else {
            const jitter = 0.3 * (Math.random() - 0.5) * Math.abs(leftIdx - rightIdx);
            const midIdx = Math.round(leftIdx + ((rightIdx - leftIdx) / 2));
            let newHeight = midHeight + jitter;
            newHeight = Math.min(newHeight, this.maxHeight);
            newHeight = Math.max(newHeight, this.minHeight);
            heightMap[midIdx] = newHeight;
            this.midpointDisplacement(heightMap, leftIdx, midIdx);
            this.midpointDisplacement(heightMap, midIdx, rightIdx);
        }

    }

    public render() {
        const context = this.context;
        context.beginPath();

        for (let index = 0; index < this.heightMap.length; index++) {
            const height = this.heightMap[index];
            context.fillStyle = "#663300";
            context.fillRect(this.x + index, this.y - height, 1, this.y);
            context.fillStyle = "#006400";
            context.fillRect(this.x + index, this.y - height - 4, 1, 4);
        }
    }

    public getGlobalHeight(x: number): number {
        return this.y - this.heightMap[Math.round(x)];
    }

}
