const cellCount = 401;

class SpatialHashGrid {
    constructor(game) {
        this.game = game;
        this.cells = [];
        
        for (let x = 0; x < cellCount; x++) {
            this.cells[x] = [];
            for (let y = 0; y  < cellCount; y++) {
                this.cells[x][y] = [];
            }
        }
        // this.cells[x][y] gives you a cell with entities in it
    }

    _allocateToCell(position) {
        // get 5 in every direction (up down left right)
        return [Math.floor(position[0] / 6), Math.floor(position[1] / 6)];
    }

    insert(position, size = [1, 1], info) {
        const entity = {
            position, // Position in game
            size, // Size of entity
            info, // Info about entity
        };

        const [x, y] = this._allocateToCell(position);
        if (!this.cells[x][y]) console.log(x, y);
        this.cells[x][y].push(entity);
    }

    find(position) {
        const [x, y] = this._allocateToCell(position);
        return this.cells[x][y];
    }
}

const grid = new SpatialHashGrid();
// -- INSERT ALL CLIENTS -- //
const now = performance.now();
for (let x = -1000; x < 1000; x++) {
    for (let y = -1000; y < 1000; y++) {
        grid.insert([x, y], [1, 1], {});
    }
}
const now1 = performance.now();
console.log('All Client Insertion Time:', now1 - now);

// -- FIND CLIENTS NEAR POSITION -- //
const now2 = performance.now();
const near = grid.find([0, 0]);
const now3 = performance.now();
console.log('Find Time', now3 - now2);
console.log(near);