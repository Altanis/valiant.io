/** 
 * Stores entity positions in a grid and checks for collisions.
 * Credits to @PaulJohnson11 on Repl.it for his implementation of a Spatial Hashgrid.
*/

class Box {
    /** The x-coordinate of the middle of the box. */
    x: number;
    /** The y-coordinate of the middle of the box. */
    y: number;
    /** The width of the box. */
    w: number;
    /** The height of the box. */
    h: number;
    /** The query ID of the box. */
    queryId: number | undefined;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    collidesWith(box: Box) {
        return !(
            this.x - this.w / 2 > box.x + box.w / 2 ||
            this.x + this.w / 2 < box.x - box.w / 2 ||
            this.y - this.h / 2 > box.y + box.h / 2 ||
            this.y + this.h / 2 < box.y - box.h / 2
        );
    }
}

export default class SpatialHashGrid {
    cells = new Map<number, Box[]>();
    cellSize = 4;
    queryId = 0;
    entities = 0;
    
    /**
     * Inserts an entity into the grid.
     * @param x The x-coordinate of the entity.
     * @param y The y-coordinate of the entity.
     * @param w The width of the entity.
     * @param h The height of the entity.
     */
    insert(x: number, y: number, w: number, h: number) {
        this.entities++;

        const box = new Box(x, y, w, h);

        const startX = box.x >> this.cellSize;
        const startY = box.y >> this.cellSize;
        const endX = ((box.x + box.w) >> this.cellSize) + 1;
        const endY = ((box.y + box.h) >> this.cellSize) + 1;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 0xB504;
                
                if (!this.cells.has(key)) this.cells.set(key, []);
                this.cells.get(key)?.push(box);
            }
        }
    }

    /**
     * Checks for entities near the given entity.
     * @param x The x-coordinate of the entity.
     * @param y The y-coordinate of the entity.
     * @param w The width of the entity.
     * @param h The height of the entity.
     */
    query(x: number, y: number, w: number, h: number) {
        const box = new Box(x, y, w, h);

        const startX = box.x >> this.cellSize;
        const startY = box.y >> this.cellSize;
        const endX = ((box.x + box.w) >> this.cellSize) + 1;
        const endY = ((box.y + box.h) >> this.cellSize) + 1;

        const found: Box[] = [];

        const queryId = this.queryId++;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 0xB504;

                const cell = this.cells.get(key);

                if (!cell) continue;
                
                for (let i = 0; i < cell.length; i++) {
                    const box: Box = cell[i];

                    if (box.queryId !== queryId) {
                        box.queryId = queryId;
                        found.push(box);
                    }
                }
            }
        }

        return found;
    }

    clear() {
        this.cells.clear();
    }
}