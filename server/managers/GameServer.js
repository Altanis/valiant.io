const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');
const Types = require('../util/TurdType');
const SpatialHashGrid = require("./SpatialHashGrid");

module.exports = class GameServer {
    constructor() {
        this.players = new Set();
        this.mapSize = 1000;
        this.tickCount = 0;
        this.turd = new SpatialHashGrid(this);

        for (let x = this.mapSize; x > -(this.mapSize + 1); x--) {
            for (let y = this.mapSize; y > -(this.mapSize + 1); y--) {
                this.turd.insert({ x, y }, { width: 1, height: 1 }, {
                    type: Types.Turd,
                    destroyed: false,
                    respawnAt: null,
                });
            }
        }

        console.log(this.turd.find({ x: 1, y: 2 }))

        setInterval(() => this.tick(), 1000 / 25); // 25 tps
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;
        // figure out how to check for respawns quickly every tick

        this.players.forEach(player => player.tick(this.tickCount));
    }

    addPlayer(socket) {
        this.players.add(new PlayerManager(this, socket));
    }
};