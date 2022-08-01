const { Server } = require('ws');
const wss = new Server({ port: 3000 });

const GameServer = require('./managers/GameServer');
const PlayerManager = require('./managers/PlayerManager');

/**
 * PROTOCOL
 * SERVERBOUND:
    * INIT: Initiates packet exchange. 
 * CLIENTBOUND:
    * INVALID_BUILD: Invalid build sent in INIT packet. Returns { build: CURRENT_BUILD }
 * ERRNO CODES
 * 
 * 1000 - Too Many Connections
 * 1001 - Cheater Detected
 * 1002 - Update Version
 * 1006 - Unknown Error
 */

process.game = new GameServer();
process.CURRENT_BUILD = '213c2b12008132227b50c8441ee1639a54e0a104f7702a87796db70be6fec7ab';

wss.on('listening', () => console.log('Server is listening for connections.'));
wss.on('connection', function(socket, request) {
    socket.ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    if ([...wss.clients].filter(client => client.ip === socket.ip).length > 1) return socket.close(1000);

    if (!request.headers.upgrade ||
        !request.headers.connection ||
        !request.headers.host ||
        !request.headers.pragma ||
        !request.headers["cache-control"] ||
        !request.headers["user-agent"] ||
        !request.headers["sec-websocket-version"] ||
        !request.headers["accept-encoding"] ||
        !request.headers["accept-language"] ||
        !request.headers["sec-websocket-key"] ||
        !request.headers["sec-websocket-extensions"]) return socket.close(1001);

    process.game.addPlayer(new PlayerManager(socket));
});