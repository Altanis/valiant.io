export default class SpatialHashGrid {
    /** The chunks inside the spatial hashgrid. */
    cells = new Map<number, number[]>;
    /** The size of each chunk. */
    cellSize = 4;

    constructor() {
        if (!this.cellSize || (this.cellSize & (this.cellSize - 1)))
            throw new Error("Could not initialize SpatialHashGrid: Cell size must be a power of 2.");
    }

    /**
     * Inserts an entity into the grid.
     * @param x The x-coordinate of the entity.
     * @param y The y-coordinate of the entity.
     * @param w The width of the entity.
     * @param h The height of the entity.
     * @param id The entity ID.
    */
    insert(x: number, y: number, w: number, h: number, id: number) {
        const startX = x >> this.cellSize;
        const startY = y >> this.cellSize;
        const endX = ((x + w) >> this.cellSize) + 1;
        const endY = ((y + h) >> this.cellSize) + 1;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 0xB504;

                if (!this.cells.has(key)) this.cells.set(key, []);
                this.cells.get(key)?.push(id);
            }
        }
    }

    /**
     * Checks for entities near the given entity.
     * @param x The x-coordinate of the entity.
     * @param y The y-coordinate of the entity.
     * @param w The width of the entity.
     * @param h The height of the entity.
     * @param range Whether or not to check as a range or as a collision.
     */
    query(x: number, y: number, w: number, h: number, id: number, range = false): number[] {
        let startX: number, startY: number, endX: number, endY: number;

        if (range) {
            startX = (x - w / 2) >> this.cellSize;
            startY = (y - h / 2) >> this.cellSize;
            endX = ((x + w / 2) >> this.cellSize) + 1;
            endY = ((y + h / 2) >> this.cellSize) + 1;
        } else {
            startX = x >> this.cellSize;
            startY = y >> this.cellSize;
            endX = ((x + w) >> this.cellSize) + 1;
            endY = ((y + h) >> this.cellSize) + 1;
        }

        const found: number[] = [];

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 0xB504;

                const cell = this.cells.get(key);
                if (!cell) continue;

                for (let i = cell.length; i --> 0;) {
                    const entityId = cell[i];

                    if (
                        !found.includes(entityId) &&
                        entityId !== id
                    ) {
                        found.push(entityId);
                    }
                }
            }
        }

        return found;
    }

    /** Clears the entities from the grid. */
    clear() {
        this.cells.clear();
    }
}