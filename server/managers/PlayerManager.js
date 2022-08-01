const Colors = require('../util/Colors');

module.exports = class PlayerManager {
    constructor(game, socket) {
        this.game = game;
        this.angle = 0;
        this.moving = false;
        this.pinged = false;

        this.position = { x: 0, y: 0 };
        this.socket = socket;
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

        this.pinged = false;
        this.send({ header: 'PING' });
    }

    send(message) {
        if (typeof message !== 'string') message = JSON.stringify(message);
        this.socket.send(message);
    }

    close(code) {
        this.socket.close(code || 1006);
    }
}