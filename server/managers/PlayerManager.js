const Vector = require('../structs/Vector');
const Colors = require('../util/Colors');

module.exports = class PlayerManager {
    constructor(game, socket) {
        this.game = game;
        this.angle = 0;
        this.moving = false;
        this.pinged = false;

        this.name = '';
        this.alive = false;
        this.account = null;

        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);

        this.socket = socket;
        this.id = game.players.size;
        this.color = Colors.BROWN;

        this._attachListeners();
    }

    _close() {
        this.game.players.delete(this);
    }

    _attachListeners() { 
        this.socket.on('close', () => this._close());
        this.socket.on('error', console.error); // haha RSV1 error go brr
        this.socket.on('message', msg => this.game.handlePayload(this, msg));
    }

    tick(count) { 
        if (this.pinged) doMagic(); // doMagic = send changes
        this.position = this.position.add(this.velocity);

        this.pinged = false;
        this.send(new Uint8Array([1])); // no need of wasting resources importing and instantiating a class
        // this.send({ header: 'PING' });
    }

    send(message) {
        this.socket.send(message);
    }

    close(code) {
        this.socket.close(code || 1006);
    }
}