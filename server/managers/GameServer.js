const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');

module.exports = class GameServer {
    constructor() {
        this.players = new Set();
        this.mapSize = 10000;
        this.tickCount = 0;
        // i dont think there's a need for entities

        setInterval(() => this.tick(), 100 / 9); // 11.11111ms
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;
        this.players.forEach(player => player.tick(this.tickCount));
    }

    addPlayer(socket) {
        this.players.add(new PlayerManager(socket));
    }
};