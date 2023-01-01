import WebSocket from 'ws';
import { IncomingMessage } from "http";

import { ConnectionsPerIP } from '../Const/Config';
import { CloseEvent, ClientBound } from '../Const/Enums';
import CharacterDefinition from '../Const/Game/Definitions/CharacterDefinition';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';
import Vector from './Vector';

export default class PlayerHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    /** The ID of the Player. */
    public id: number;
    /** The WebSocket representing the player. */
    public socket: WebSocket;
    /** The IP of the WebSocket connection. */
    public ip: string;
    /** The character the player possesses. */
    public character?: CharacterDefinition;
    /** The index of the ability the player has equipped. */
    public abilityIndex?: number;
    /** The binary encoder for the player. */
    public SwiftStream = new SwiftStream();

    /** PLAYER DATA INGAME */
    /** The name of the player. */
    public name: string = "unknown";
    /** Whether or not the player is alive. */
    public alive: boolean = false;
    /** The position of the player. */
    public position: Vector | null = null;
    /** The velocity of the player. */
    public velocity: Vector | null = null;

    constructor(server: GameServer, request: IncomingMessage, socket: WebSocket) {
        this.server = server;
        this.id = this.server.players.size + 1;
        this.socket = socket;

        this.addHandlers(socket);
        
        this.ip = request.headers['x-forwarded-for']?.toString().split(',').at(-1) || request.socket.remoteAddress || "";
        this.ip && this.checkIP(request);
    }

    private addHandlers(socket: WebSocket): void {
        socket.on("close", () => this.close(CloseEvent.Unknown));
        socket.on("message", (b: ArrayBufferLike) => {
            const buffer = new Uint8Array(b);
            this.SwiftStream.set(buffer);

            const header = this.SwiftStream.ReadI8();
            if (!ClientBound[header]) return this.close(CloseEvent.InvalidProtocol); // Header does not match any known header.

            switch (header) {
                case ClientBound.Spawn: return this.server.MessageHandler.Spawn(this);
            }
        });
    }

    private checkIP(request: IncomingMessage): void {
        if (this.server.banned.includes(this.ip)) {
            request.destroy(new Error("A banned user tried to connect."));
            return this.close(CloseEvent.Banned);
        }

        let sum = 0;
            
        this.server.players.forEach(player => {
            if (player.ip === this.ip) sum++;
        });

        if (sum > ConnectionsPerIP) {
            request.destroy(new Error("Threshold for maximum amount of connections has been exceeded."));
            return this.close(CloseEvent.TooManyConnections);
        }
    }

    public close(reason: number) {
        this.socket.close(reason);
        this.server.players.delete(this);
    }
};