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

        this.old = {
            position: new Vector(0, 0),
            size: { width: 100, height: 100 },
            points: 0,
        }

        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);

        this.socket = socket;
        this.id = game.players.length;
        this.color = Colors.BROWN;

        this._attachListeners();
    }

    get updated() {
        return (this.position.x !== this.old.position.x || this.position.y !== this.old.position.y) ||
            (this.size.width !== this.old.size.width || this.size.height !== this.old.size.height) ||
            this.points !== this.old.points;
    }

    _close() {
        this.game.players.splice(this.game.players.indexOf(this), 1);
    }

    _attachListeners() { 
        this.socket.on('close', () => this._close());
        this.socket.on('error', console.error);
        this.socket.on('message', msg => this.game.handlePayload(this, msg));
    }

    update() {
        this.old.position = this.position;
        this.position.add(this.velocity);
        // update size, fov, points, etc
    }

    tick(count) {
        this.update();

        if (this.pinged && typeof this.alive !== 'object') {
            const update = new Writer().i8(2);

            if (this.updated) {
                const range = Math.floor(this.points / 1000 + 5);

                if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                    update.i8(0); // turd field
                    for (let rangedX = range + 1; rangedX--;) {
                        for (let rangedY = range + 1; rangedY--;) {
                            const [type, [x, y], respawnAt] = this.game.turd[this.position.x - rangedX][this.position.y - rangedY];
                            if (respawnAt) update.i8(type).u32(x).u32(y);
                        }
                    }
                    update.i8(-1);

                    update.i8(1) // player field
                        .i8(this.color)
                        .u32(this.points)
                        .u32(this.position.x)
                        .u32(this.position.y)
                        .u32(this.size.width)
                        .u32(this.size.height)
                        .u32(range)
                    .i8(-1);
                }
    
                this.send(update.out());
            }
        }

        if (count % 5 === 0) {
            this.pinged = false;
            this.send(new Int8Array([1])); // no need of wasting resources importing and instantiating a class
        }
    }

    send(message) {
        this.socket.send(message);
    }

    close(code) {
        this.socket.close(code || 1006);
    }
}