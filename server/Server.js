require('dotenv').config();

// -- INITIALIZE SERVERS --
const Express = require('express');
const app = Express();
const server = app.listen(3000, () => console.log('HTTP Server listening [PORT 3000].'));

const { Server } = require('ws');
const wss = new Server({ server });

// -- SET UP DATABASE -- //
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to Database.'))
    .catch(error => console.error('Could not connect to database: ', error));
    
// -- SET UP SERVERS -- //
const AccountRouter = require('./routes/AccountRouter');
app.use(Express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (!request.headers.upgrade ||
        !request.headers.connection ||
        !request.headers.host ||
        !request.headers.pragma ||
        !request.headers["cache-control"] ||
        !request.headers["user-agent"]) return;
    next();  
})
app.use('/account', AccountRouter);

const GameServer = require('./managers/GameServer');
const PlayerManager = require('./managers/PlayerManager');

const game = new GameServer();

wss.on('listening', () => console.log('Server is listening for connections.'));
wss.on('connection', function(socket, request) {
    socket.ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    if ([...wss.clients].filter(client => client.ip === socket.ip).length > 1) 
        return socket.close(1000);

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
        !request.headers["sec-websocket-extensions"])
            return socket.close(1001);

    game.addPlayer(socket);
});