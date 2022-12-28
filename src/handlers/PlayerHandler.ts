import WebSocket from 'ws';
import { IncomingMessage } from "http";

import GameServer from '../GameServer';
import { ConnectionsPerIP } from '../typings/Config';

export default class PlayerHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    /** The ID of the Player. */
    public id: number;
    /** The WebSocket representing the player. */
    public socket: WebSocket;
    /** The IP of the WebSocket connection. */
    public ip: string;

    constructor(server: GameServer, request: IncomingMessage, socket: WebSocket) {
        this.server = server;
        this.id = this.server.players.size + 1;
        this.socket = socket;
        
        this.ip = request.headers['x-forwarded-for']?.at(-1) || request.socket.remoteAddress || "";
        this.ip && this.checkIP(request);
    }

    private checkIP(request: IncomingMessage): void {
        if (this.server.banned.includes(this.ip)) {
            request.destroy(new Error("A banned user tried to connect."));
            return this.socket.send("Banned.");
        }

        let sum = 0;
            
        this.server.players.forEach(player => {
            if (player.ip === this.ip) sum++;
        });

        if (sum > ConnectionsPerIP) {
            request.destroy(new Error("Threshold for maximum amount of connections has been exceeded."));
            return this.socket.send("maxConnections");
        }
    }
};