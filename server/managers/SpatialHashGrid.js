const cellCount = 25;

module.exports = class SpatialHashGrid {
    constructor(game) {
        this.game = game; // this.game.mapSize has the bounds for the game
        this.cells = Array(cellCount).fill(Array(cellCount)); // grid
    }

    insert(position, size, info) {
        const client = { 
            position, 
            size, 
            cells: { min: null, max: null, nodes: null, },
            info,
        }; // nodes is a NodeList, with nodes pointing to whats next to it.

        const { x, y } = position;
        const { width: w, height: h } = size;

        const i1 = this._findCell(x - w / 2, y - h / 2);
        const i2 = this._findCell(x + w / 2, y + h / 2);

        const nodes = [];

        for (let x = i1[0], x2 = i2[0]; x <= x2; x++) {
            nodes.push([]);
            
            for (let y = i1[1], y2 = i2[1]; y <= y2; y++) {
                const xIndex = x - i1[0];
                const node = { next: null, prev: null, client, };

                nodes[xIndex].push(node);
                node.next = this.cells[x][y];
                if (this.cells[x][y]) {
                    this.cells[x][y].prev = node;
                }

                this.cells[x][y] = client;
            }
        }

        client.cells.min = i1;
        client.cells.max = i2;
        client.cells.nodes = nodes;

        return client;
    }

    find(position, area = [25, 25]) {
        const { x, y } = position;
        const [w, h] = area;

        const clients = [];

        const i1 = this._findCell(x - w / 2, y - h / 2);
        const i2 = this._findCell(x + w / 2, y + h / 2);

        for (let x = i1[0], x2 = i2[0]; x <= x2; x++) {
            for (let y = i1[1], y2 = i2[1]; y <= y2; y++) {
                let node = this.cells[x][y];
                while (node) {
                    if (!clients.includes(node)) {
                        console.log(node);
                        clients.push(node);
                    }

                    node = node.next;
                }   
            }
        }

        return clients;
    }

    delete(client) {
        const i1 = client.cells.min, i2 = client.cells.max;

        for (let x = i1[0], x2 = i2[0]; x <= x2; x++) {
            for (let y = i1[1], y2 = i2[1]; y <= y2; y++) {
                const xIndex = x - i1[0];
                const yIndex = y - i1[1];

                const node = client.cells.nodes[xIndex][yIndex];
                if (node.next) node.next.prev = node.prev;
                if (node.prev) node.prev.next = node.next;
                if (!node.prev) this.cells[x][y] = node.next;
            }
        }

        client.cells.min = null, client.cells.max = null, client.cells.nodes = null;
    }

    update(client) {
        const { x, y } = client.position;
        const { width: w, height: h } = client.size;

        const i1 = this._findCell(x - w / 2, y - h / 2);
        const i2 = this._findCell(x + w / 2, y + h / 2);

        if (client.cells.min[0] === i1[0] &&
            client.cells.min[1] === i1[1] && 
            client.cells.max[0] === i2[0] &&
            client.cells.max[1] === i2[1]) return;

        this.delete(client);
        this.insert(client, client.size);

        return client;
    }

    _findCell(x, y) {
        x = Math.min(Math.max(x + this.game.mapSize, 0) / (this.game.mapSize * 2), 1);
        y = Math.min(Math.max(y + this.game.mapSize, 0) / (this.game.mapSize * 2), 1);

        const xIndex = Math.floor(x * (cellCount - 1));
        const yIndex = Math.floor(y * (cellCount - 1));

        return [xIndex, yIndex];
    }
}