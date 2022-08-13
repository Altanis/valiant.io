const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');
const Types = require('../util/TurdType');
const SpatialHashGrid = require("../structs/SpatialHashGrid");

module.exports = class GameServer {
    constructor() {
        this.players = [];
        this.mapSize = 2000;
        this.tickCount = 0;

        this.turd = new Array(this.mapSize);
        for (let x = this.turd.length; x--;) {
            this.turd[x] = [];
            for (let y = this.turd.length; y--;) {
                this.turd[x][y] = [Types.Turd, null];
            }
        }

        setInterval(() => this.tick(), 1000 / 25); // 25 tps
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;

        for (const player of this.players) {
            player.tick(this.tickCount);
        }
    }

    addPlayer(socket) {
        this.players.push(new PlayerManager(this, socket));
    }
};