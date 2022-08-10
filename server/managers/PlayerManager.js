const Vector = require('../structs/Vector');
const { Writer } = require('../util/Coder');
const Colors = require('../util/Colors');
const Types = require('../util/TurdType');

module.exports = class PlayerManager {
    constructor(game, socket) {
        this.game = game;
        this.angle = 0;
        this.moving = false;
        this.pinged = false;

        this.name = '';
        this.alive = null;
        this.points = 0;
        this.size = { width: 100, height: 100 };

        this.account = null;

        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);

        this.socket = socket;
        this.id = game.players.length;
        this.color = Colors.BROWN;

        this._attachListeners();
    }

    _close() {
        this.game.players.splice(this.game.players.indexOf(this), 1);
    }

    _attachListeners() { 
        this.socket.on('close', () => this._close());
        this.socket.on('error', console.error); // haha RSV1 error go brr
        this.socket.on('message', msg => this.game.handlePayload(this, msg));
    }

    tick(count) {
        this.position.add(this.velocity);

        if (this.pinged && typeof this.alive !== 'object') {
            // Payload MAGIC

            // Field ARENA
            const arena = new Writer().i8(2).i8(0);

            const range = Math.floor(this.points / 1000 + 5); // flawed formula, will make a better one later

            for (let rangedX = range + 1; rangedX--;) {
                for (let rangedY = range + 1; rangedY--;) {
                    const [type, [x, y]] = this.game.turd[this.position.x - rangedX][this.position.y - rangedY];
                    arena.i8(type).u32(x).u32(y).u32(1).u32(1);
                }
            }

            // Field PLAYERS
            

            this.send(arena.i8(-1).out());
        }

        this.pinged = false;
        this.send(new Int8Array([1])); // no need of wasting resources importing and instantiating a class
    }

    send(message) {
        this.socket.send(message);
    }

    close(code) {
        this.socket.close(code || 1006);
    }
}