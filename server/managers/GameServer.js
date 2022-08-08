const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');
const Types = require('../util/TurdType');
const SpatialHashGrid = require("../structs/SpatialHashGrid");

module.exports = class GameServer {
    constructor() {
        this.players = [];
        this.mapSize = 2000;
        this.tickCount = 0;
        this.arena = new SpatialHashGrid(this);

        for (let x = 0; x < this.mapSize; x++) {
            for (let y = 0; y < this.mapSize; y++) {
                this.arena.insert(x, y, 1, 1, {
                    type: Types.Turd,
                    destroyed: 0,
                    respawnAt: null,
                });
            }
        }

        setInterval(() => this.tick(), 1000 / 25); // 25 tps
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;

        for (let i = this.players.length; i--;) {
            const player = this.players[i];
            const oldCoords = [player.position.x, player.position.y, Types.Player]; // does not update
            player.updatePos();
            if (player.x !== oldCoords[0] || player.y !== oldCoords[1]) this.arena.update(oldCoords, [player.position.x, player.position.y, player.size.width, player.size.height, { type: Types.Player }]);
            player.tick(this.tickCount);
        }
    }

    addPlayer(socket) {
        this.players.push(new PlayerManager(this, socket));
    }
};