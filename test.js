class Box {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    collidesWith(box) {
        return !(this.x - this.w / 2 > box.x + box.w / 2 ||
            this.x + this.w / 2 < box.x - box.w / 2 ||
            this.y - this.h / 2 > box.y + box.h / 2 ||
            this.y + this.h / 2 < box.y - box.h / 2);
    }
}

class SpatialHashGrid {
    constructor() {
        this.cells = [];
        this.entities = 0;
        this.queryId = 0;
        // pre-allocate the grid cells
        for (let i = 0; i < SpatialHashGrid.HASH_SIZE * SpatialHashGrid.HASH_SIZE; i++) {
            console.log("those bad things", i);
            this.cells.push([]);
        }
    }
    insert(x, y, w, h) {
        this.entities++;
        console.log("entity", this.entities);
        const box = new Box(x, y, w, h);
        const startX = (x >> SpatialHashGrid.CELL_SIZE);
        const startY = (y >> SpatialHashGrid.CELL_SIZE);
        const endX = ((x + w) >> SpatialHashGrid.CELL_SIZE) + 1;
        const endY = ((y + h) >> SpatialHashGrid.CELL_SIZE) + 1;
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * SpatialHashGrid.HASH_SIZE;
                this.cells[key].push(box);
            }
        }
    }
    query(x, y, w, h) {
        const box = new Box(x, y, w, h);
        const startX = (x >> SpatialHashGrid.CELL_SIZE);
        const startY = (y >> SpatialHashGrid.CELL_SIZE);
        const endX = ((x + w) >> SpatialHashGrid.CELL_SIZE) + 1;
        const endY = ((y + h) >> SpatialHashGrid.CELL_SIZE) + 1;
        const found = [];
        const queryId = this.queryId++;
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * SpatialHashGrid.HASH_SIZE;
                const cell = this.cells[key];
                for (let i = 0; i < cell.length; i++) {
                    const box = cell[i];
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
        // reset the query ID counter and clear the grid cells
        this.queryId = 0;
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].length = 0;
        }
    }
}
// magic number is sqrt(int32_t max)
SpatialHashGrid.HASH_SIZE = 100;
SpatialHashGrid.CELL_SIZE = 4;

const grid = new SpatialHashGrid();
console.log("but honestly i dont have much sympathy");
const insert_before = performance.now();
for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
        grid.insert(x, y, 1, 1);
    }
}
const insert_after = performance.now();
console.log('Inserting 4 million entities took:', insert_after - insert_before, 'ms');
const find_before = performance.now();
const near = grid.query(3, 3, 25, 25);
const find_after = performance.now();
console.log('Finding something near a position took:', find_after - find_before, 'ms');
console.log(near.reverse());