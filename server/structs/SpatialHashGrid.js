// Credits to Crabby for his implementation of a Spatial Hash Grid. (my personal implementation is at ./zpersonal_grid.js)
// I will be using this for some time to focus on development of Digturd.io.

const cellSize = 4;

class Box {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    collidesWith(box) {
        return !(this.x > box.x + box.w || this.x + this.w < box.x || this.y > box.y + box.h || this.y + this.h < box.y);
    }
}

class SpatialHashGrid {
    cells = new Map();
    cellSize = 4;
    queryId = 0;
    
    insert(x, y, w, h, info) {
        const box = new Box(x, y, w, h);

        const startX = box.x >> this.cellSize;
        const startY = box.y >> this.cellSize;
        const endX = ((box.x + box.w) >> this.cellSize) + 1;
        const endY = ((box.y + box.h) >> this.cellSize) + 1;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 46340; // magic number is sqrt(int32_t max)
                
                if (!this.cells.has(key)) this.cells.set(key, []);
                this.cells.get(key).push({ box, info });
            }
        }
    }

    query(x, y, w, h) {
        const box = new Box(x, y, w, h);

        const startX = box.x >> this.cellSize;
        const startY = box.y >> this.cellSize;
        const endX = ((box.x + box.w) >> this.cellSize) + 1;
        const endY = ((box.y + box.h) >> this.cellSize) + 1;

        const found = [];

        const queryId = this.queryId++;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 46340;

                const cell = this.cells.get(key);

                if (!cell) continue;
                
                for (let i = 0; i < cell.length; i++) {
                    const node = cell[i];

                    if (node.box.queryId !== queryId) {
                        node.box.queryId = queryId;
                        if (box.collidesWith(node.box))
                            found.push(cell[i]);
                    }
                }
            }
        }

        return found;
    }

    remove(x, y, type) {
        const box = new Box(x, y, 0, 0);

        const startX = box.x >> this.cellSize;
        const startY = box.y >> this.cellSize;
        const endX = ((box.x + box.w) >> this.cellSize) + 1;
        const endY = ((box.y + box.h) >> this.cellSize) + 1;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const key = x + y * 46340;
                const cell = this.cells.get(key);

                if (!cell) continue;
                
                for (let i = 0; i < cell.length; i++) {
                    const node = cell[i];
                    if (node.box.x === box.x && node.box.y === box.y && node.info.type === type) return cell.splice(cell.indexOf(node), 1);
                }
            }
        }
    }

    update(o, n) {
        const [x1, y1, type] = o;
        const [x2, y2, w2, h2, info] = n;

        this.remove(x1, y1, type);
        this.insert(x2, y2, w2, h2, info);
    }

    clear() {
        this.cells.clear();
    }
}

module.exports = SpatialHashGrid;
/*const grid = new SpatialHashGrid();

const insert_before = performance.now();
for (let x = 0; x < 2000; x++) {
    for (let y = 0; y < 2000; y++) {
        grid.insert(x, y, 1, 1, { type: 1, destroyed: 0, respawnAt: 1248943034 });
    }
}
const insert_after = performance.now();
console.log('Inserting 4 million entities took:', insert_after - insert_before, 'ms');

const find_before = performance.now();
const near = grid.query(3, 3, 25, 25);
const find_after = performance.now();
console.log('Finding something near a position took:', find_after - find_before, 'ms');
console.log(near.reverse());

const update_before = performance.now();
grid.update([ 732, 741, 0 ], [732, 733, 1, 1, { type: 0, destroyed: 0, respawnAt: 232 }]);
const update_after = performance.now();
console.log('Updating an entity took:', update_after - update_before, 'ms');
console.log(grid.query(732, 733, 1, 1).filter(obj => obj.box.x === 732));*/