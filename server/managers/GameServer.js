const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');

module.exports = class GameServer {
    constructor() {
        this.players = new Set();
        this.mapSize = 1000;
        this.tickCount = 0;
        this.database = { // Will set up a proper database later.
            accounts: {},
            banned: [],
        };

        this.dirt = new Uint8Array(this.mapSize * this.mapSize);

        setInterval(() => this.tick(), 1000 / 25); // 25 tps
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;
        this.players.forEach(player => player.tick(this.tickCount));
    }

    addPlayer(socket) {
        this.players.add(new PlayerManager(this, socket));
    }
};