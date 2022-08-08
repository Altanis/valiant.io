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

    updatePos() {
        this.position.add(this.velocity);
    }

    tick(count) {
        if (this.pinged && typeof this.alive !== 'object') {
            const writer = new Writer().i8(2).i8(0); // Payload MAGIC, arena field

            const range = Math.floor(this.points / 1000 + 5);
            const found = this.game.arena.query(this.position.x, this.position.y, range, range);

            for (let i = found.length; i--;) {
                const entity = found[i];
                writer.i8(entity.info.type).u32(entity.box.x).u32(entity.box.y).u32(entity.box.w).u32(entity.box.h);

                /*switch (entity.info.type) { // When specialization occurs
                }*/
            }

            this.send(writer.i8(-1).out()); //  Figure out how to terminate
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