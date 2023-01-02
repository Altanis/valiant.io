import WebSocket from 'ws';
import { IncomingMessage } from "http";

import { ConnectionsPerIP } from '../Const/Config';
import { CloseEvent, ClientBound, ServerBound, Fields } from '../Const/Enums';
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
    /** The binary encoder for the player. */
    public SwiftStream = new SwiftStream();
    /** The character the player possesses. */
    public character?: CharacterDefinition;
    /** The index of the ability the player has equipped. */
    public abilityIndex?: number;
    /** Whether or not the player needs to be force updated. An array of properties is given. */
    public update: Set<string> = new Set();

    /** PLAYER DATA INGAME */
    /** The name of the player. */
    public name: string = "unknown";
    /** Whether or not the player is alive. */
    public alive: boolean = false;
    /** The position of the player. */
    public position: Vector | null = null;
    /** The velocity of the player. */
    public velocity: Vector | null = null;
    /** 
     * The angle at which the player is facing.
     * Measured in radians, range [-Math.PI, Math.PI].
    */
    public angle: number = 0;

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
            this.SwiftStream.Set(buffer);

            const header = this.SwiftStream.ReadI8();
            if (!ServerBound[header]) return this.close(CloseEvent.InvalidProtocol); // Header does not match any known header.

            switch (header) {
                case ServerBound.Spawn: return this.server.MessageHandler.Spawn(this);
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

    /** Sends creation data of the player. */
    public SendUpdate() {
        this.SwiftStream.Clear();
        this.SwiftStream.WriteI8(ClientBound.Update);

        /** Checks if the client requires an update. */
        if (this.update.size) {
            /** Signifies a client update. */
            this.SwiftStream.WriteI8(0x00);
            /** Tells the client their Entity ID. */
            this.SwiftStream.WriteI8(this.id);
            /** Tells the client the amount of field updates for the player. */
            this.SwiftStream.WriteI8(this.update.size);
            /** Informs the client of what properties have changed. */
            this.update.forEach(property => {
                switch (property) {
                    case "position": this.SwiftStream.WriteI8(Fields.Position).WriteFloat32(this.position!.x).WriteFloat32(this.position!.y); break;
                }
            });
        }

        /** TODO(Altanis): Inform client of surroundings. */
        // Note to self: Signify a world update by WriteI8(0x01).

        this.update.clear();
        const buffer = this.SwiftStream.Write();
        if (buffer.byteLength > 1) this.socket.send(buffer);
    }

    public close(reason: number) {
        this.socket.close(reason);
        this.server.players.delete(this);
    }

    /** Tick-loop called by main game loop. */
    public tick() {
        if (this.alive) {
            /** Move position by player's velocity, reset player velocity. */
            this.position!.add(this.velocity!);
            this.velocity!.x = this.velocity!.y = 0;

            /** Reinsert into the hashgrid with updated position. Player is 50x50 in dimension. */
            this.server.SpatialHashGrid.insert(this.position!.x, this.position!.y, 50, 50);

            /** Send update to player. */
            this.SendUpdate();
        }
    }
};