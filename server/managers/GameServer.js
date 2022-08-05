const PlayerManager = require("./PlayerManager");
const HandleMessage = require('../handlers/PayloadHandler');
const { Types, States } = require('../util/TurdType');

module.exports = class GameServer {
    constructor() {
        this.players = new Set();
        this.mapSize = 10000;
        this.tickCount = 0;

        this.turd = new Uint8Array(this.mapSize * this.mapSize * 5); // 1 byte for the type of turd, 4 bytes for respawn tick
        let length = this.turd.length;
        while (length--) {
            if (length % 5 === 0) // a turd type byte
                this.turd[length] = Types.Turd | States.NotDestroyed;
        }

        setInterval(() => this.tick(), 1000 / 25); // 25 tps
    }

    handlePayload(player, msg) {
        HandleMessage(player, msg);
    }

    tick() {
        this.tickCount++;
        if (this.turd.indexOf(this.tickCount) !== -1) { // turd wants to respawn this tick

        }

        this.players.forEach(player => player.tick(this.tickCount));
    }

    addPlayer(socket) {
        this.players.add(new PlayerManager(this, socket));
    }
};