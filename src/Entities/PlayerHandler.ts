import WebSocket from 'ws';
import { IncomingMessage } from "http";

import { ConnectionsPerIP } from '../Const/Config';
import { CloseEvent, ClientBound, ServerBound, Fields, Entities } from '../Const/Enums';
import CharacterDefinition from '../Const/Game/Definitions/CharacterDefinition';
import { WeaponDefinition } from '../Const/Game/Definitions/WeaponDefinition';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';

import Entity from './Entity';

export default class PlayerHandler extends Entity {
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
    /** The weapon the player is hoding. */
    public weapon: WeaponDefinition | null = null;
    /** The amount of ticks needed to be passed before another attack. */
    public cooldown: number = 0;

    /** The health of the player. */
    public health: number = 0;
    /** The armor of the player. */
    public armor: number = 0;
    /** The energy of the player. */
    public energy: number = 0;

    /** 
     * The angle at which the player is facing.
     * Measured in radians, with range of [-Math.PI, Math.PI].
    */
    public angle: number = Math.PI;
    /** The angular velocity of the player (Δr/Δt). */
    public angularVelocity: number = 0;
    
    /** Attack information for the player. */
    
    public attacking = false;
    public autoAttack = false;

    /** 
     * The field of vision of the client.
     * FOV of 1 -> (1881, 941); default FOV is 0.9.
    */
    public fov = 0.9; // TODO(Altanis): Let characters have different fovs.

    constructor(server: GameServer, request: IncomingMessage, socket: WebSocket) {
        super(server, [300, 300], "Player");

        this.server = server;
        this.id = this.server.entities.length;
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
                case ServerBound.Spawn: this.server.MessageHandler.Spawn(this); break;
                case ServerBound.Movement: this.server.MessageHandler.Move(this); break;
                case ServerBound.Angle: this.server.MessageHandler.Angle(this); break;
                case ServerBound.Attack: this.server.MessageHandler.Attack(this); break;
                case ServerBound.Cheats: this.server.MessageHandler.Cheat(this); break;
                default: this.close(CloseEvent.InvalidProtocol); break;
            }

            this.SwiftStream.Clear();
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
        this.SwiftStream.WriteI8(ClientBound.Update);

        /** Checks if the client requires an update. */
        if (this.update.size) {
            /** Signifies a client update. */
            this.SwiftStream.WriteI8(0x00);
            /** Tells the client the amount of field updates for the player. */
            this.SwiftStream.WriteI8(this.update.size);
            /** Informs the client of what properties have changed. */
            this.update.forEach(property => {
                switch (property) {
                    case "id": this.SwiftStream.WriteI8(Fields.ID).WriteI8(this.id); break;
                    case "position": this.SwiftStream.WriteI8(Fields.Position).WriteFloat32(this.position!.x).WriteFloat32(this.position!.y); break;
                    /** @ts-ignore */
                    case "attacking": this.SwiftStream.WriteI8(Fields.Attacking).WriteI8(this.attacking && !this.cooldown); break;
                    case "weapon": this.SwiftStream.WriteI8(Fields.Weapons).WriteI8(this.weapon!.id); break;
                    case "fov": this.SwiftStream.WriteI8(Fields.FOV).WriteFloat32(this.fov); break;
                }
            });
        }

        /** TODO(Altanis): Inform client of surroundings. */
        const surroundings = this.server.SpatialHashGrid.query(this.position!.x, this.position!.y, 4000 / this.fov, 2000 / this.fov, this.id, true);
        console.log(surroundings, this.position);
        if (surroundings.length) {
            this.SwiftStream.WriteI8(0x01).WriteI8(surroundings.length);
            for (const surrounding of surroundings) {
                const entity = this.server.entities[surrounding.entityId!];
                switch (entity.type) {
                    case "Player": return;
                    case "Box": this.SwiftStream.WriteI8(Entities.Box).WriteFloat32(entity.position.x!).WriteFloat32(entity.position.y!); break;
                }
            };
        }

        this.update.clear();
        const buffer = this.SwiftStream.Write();
        if (buffer.byteLength > 1) this.socket.send(buffer);
    }

    public close(reason: number) {
        // TODO(Altanis): Add to ban list.
        console.trace(reason);
        this.socket.close(reason);
        this.server.players.delete(this);
    }

    /** Tick-loop called by main game loop. */
    public tick() {
        if (this.cooldown > 0) {
            if (--this.cooldown === 0) this.attacking = false;
        }

        if (this.alive) {
            /** Move position by player's velocity, reset player velocity. */

            /** Ensure diagonal speed is consistent. */
            const distance = Math.sqrt(this.velocity!.x ** 2 + this.velocity!.y ** 2);
            if (distance && this.character) {
                this.velocity!.scale(this.character!.speed / distance);
            }

            super.tick();
            
            /** Send update to player. */
            this.SendUpdate();

            /** Tsrigger weapon if attacking. */
            if (this.attacking && this.cooldown === 0) {
                this.weapon?.trigger(this);
            }
        }
    }
};