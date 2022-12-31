import { Server } from 'ws';

import { MaximumConnections } from './Const/Config';
import { CloseEvent } from './Const/Enums';

import PlayerHandler from './handlers/PlayerHandler';
import MessageHandler from './handlers/MessageHandler';

export default class GameServer {
    /** The WebSocket server where clients connect to. */
    private wss: Server;
    /** The players in the game. */
    public players = new Set<PlayerHandler>();
    /** The list of banned players. */
    public banned: string[] = [];
    /** The handler for incoming messages. */
    public MessageHandler = new MessageHandler(this);

    constructor(port = 8080) {
        this.wss = new Server({ port });
        this.handle();
    }

    /** Sets up handlers for the WebSocket server. */
    private handle(): void {
        this.wss.on('listening', () => console.log("[WS]: Server is online. AddressInfo:", this.wss.address()));
        this.wss.on('error', er => console.error("[WS]: An error has occured.", er));
        this.wss.on('close', () => console.log("[WS]: Server closing prematurely."));
        this.wss.on('connection', (socket, request) => {
            console.log("[WS]: A new connection has been established.");
            if (this.players.size >= MaximumConnections) {
                request.destroy(new Error("Threshold for maximum amount of connections (per IP) has been exceeded."));
                return socket.close(CloseEvent.ServerFilled);
            }

            const manager = new PlayerHandler(this, request, socket);
            this.players.add(manager);
        });
    }
}