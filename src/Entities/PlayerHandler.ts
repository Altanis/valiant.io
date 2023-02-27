import WebSocket from 'ws';
import { IncomingMessage } from "http";

import { ConnectionsPerIP } from '../Const/Config';
import { CloseEvent, ClientBound, ServerBound, Fields } from '../Const/Enums';
import CharacterDefinition from '../Const/Game/Definitions/CharacterDefinition';
import { WeaponDefinition } from '../Const/Game/Definitions/WeaponDefinition';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';

import Entity from './Entity';
import { Box } from '../Managers/SpatialHashGrid';
import Vector from '../Utils/Vector';
import { constrain } from '../Utils/Functions';

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

    /** PLAYER DATA INGAME */
    /** The name of the player. */
    public name: string = "unknown";
    /** Whether or not the player is alive. */
    public alive: boolean = false;
    /** The entities surrounding the player. */
    public surroundings: Box[] = [];
    /** The weapon the player is hoding. */
    public weapon: WeaponDefinition | null = null;
    /** The amount of ticks needed to be passed before another attack. */
    public cooldown: number = 0;

    /** The health of the player. */
    private _health: number = 0;
    /** The armor of the player. */
    public armor: number = 0;
    /** The energy of the player. */
    public energy: number = 0;

    /** 
     * The angle at which the player is facing.
     * Measured in radians, with range of [-Math.PI, Math.PI].
    */
    public angle: number = Math.PI;
    
    /** Attack information for the player. */
    
    public attacking = false;
    public autoAttack = false;

    /** 
     * The field of vision of the client.
     * FOV of 1 -> (1881, 941); default FOV is 0.9.
    */
    public fov = 0.9; // TODO(Altanis): Let characters have different fovs.

    constructor(server: GameServer, request: IncomingMessage, socket: WebSocket) {
        super(server, [50, 50], "Player");

        this.server = server;
        this.id = this.server.entities.length;
        this.socket = socket;

        this.addHandlers(socket);
        
        this.ip = request.headers['x-forwarded-for']?.toString().split(',').at(-1) || request.socket.remoteAddress || "";
        this.ip && this.checkIP(request);

        /** Technical things to make modifying stats easier. */
        Object.defineProperty(this, "health", {
            get: () => this._health,
            set: (value: number) => {
                if (this.armor && value > this.armor) {
                    let o = this._health;

                    this._health = constrain(0, this._health - (value - this.armor), Infinity);
                    this.armor = 0;

                    this.update.add("armor");
                    if (o !== this._health) this.update.add("health");
                } else {
                    this._health = constrain(0, this._health - value, Infinity);
                    this.update.add("health");
                }

                return this._health;
            }
        });
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

    /** Writes update data to a buffer. */
    public write(entity = this) {
        /** Tells the client the amount of fields updated. */
        this.SwiftStream.WriteI8(entity.update.size + 1); // +1 for ID
        this.SwiftStream.WriteI8(Fields.ID).WriteI8(entity.id);

        entity.update.forEach(property => {
            switch (property) {
                case "position": this.SwiftStream.WriteI8(Fields.Position).WriteFloat32(entity.position!.x).WriteFloat32(entity.position!.y); break;
                case "attacking": this.SwiftStream.WriteI8(Fields.Attacking).WriteI8(+(entity.attacking && !entity.cooldown)); break;
                case "weapon": this.SwiftStream.WriteI8(Fields.Weapons).WriteI8(entity.weapon!.id); break;
                case "fov": this.SwiftStream.WriteI8(Fields.FOV).WriteFloat32(entity.fov); break;
                case "dimensions": this.SwiftStream.WriteI8(Fields.Dimensions).WriteFloat32(entity.dimensions[0]).WriteFloat32(entity.dimensions[1]); break;
                case "alive": this.SwiftStream.WriteI8(Fields.Alive).WriteI8(+entity.alive); break;
                case "angle": this.SwiftStream.WriteI8(Fields.Angle).WriteFloat32(entity.angle); break;
                case "health": this.SwiftStream.WriteI8(Fields.Health).WriteI8(constrain(0, entity.health, entity.health)); break;
                case "armor": this.SwiftStream.WriteI8(Fields.Armor).WriteI8(entity.armor); break;
                case "energy": this.SwiftStream.WriteI8(Fields.Energy).WriteI8(entity.energy); break;
            }
        });

        this.update.clear();
    }

    /** Collision effect with an entity. */
    public collide(entity: Entity) {
        // This function is only invoked when a player collides with a player.
    }

    /** Sends creation data of the player. */
    public SendUpdate() {        
        this.SwiftStream.WriteI8(ClientBound.Update);

        /** TODO(Altanis): Make each entity have a `write` method to update the client. */
        
        /** Checks if the client requires an update. */
        if (this.update.size) {
            /** Signifies a client update. */
            this.SwiftStream.WriteI8(0x00);
            /** Informs the client of what properties have changed. */
            this.write();
        }

        // TODO(Altanis): pretty sure querying is the only way to ensure collisions..
        /** Checks if the client requires a surrounding update. */
        const range = this.server.SpatialHashGrid.query(this.position!.x, this.position!.y, 4200 / this.fov, 2100 / this.fov, this.id, true);
        const collisions = this.server.SpatialHashGrid.query(this.position!.x, this.position!.y, this.dimensions[0], this.dimensions[1], this.id, false);

        // console.log(range, this.position);

        /** Tell client an entity is out in view. */
        /*let wroteOOV = false;
        for (const surrounding of this.surroundings) {
            const corresponding = range.find(entity => entity.entityId === surrounding.entityId);
            if (!corresponding) { // TODO: Remove entity from client.
                if (!wroteOOV) {
                    console.log("wrote OOV");
                    this.SwiftStream.WriteI8(0x01);
                    wroteOOV = true;
                }

                this.SwiftStream.WriteI8(surrounding.entityId);
            }; 
        }

        if (wroteOOV) this.SwiftStream.WriteI8(0xFF);*/

        // TODO(Altanis): Write deletions.

        if (range.length) {
            this.SwiftStream.WriteI8(0x01).WriteI8(range.length);
            for (const surrounding of range) {
                const entity = this.server.entities[surrounding.entityId!];
                /** @ts-ignore */
                entity.write(this.SwiftStream);
            };
        }

        /** Detect collisions. */
        for (const box of collisions) {
            const entity = this.server.entities[box.entityId!];
            entity.collide(this);
        }

        const buffer = this.SwiftStream.Write();
        if (buffer.byteLength > 1) this.socket.send(buffer);

        this.surroundings = range;
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
            super.tick();
            
            /** Send update to player. */
            this.SendUpdate();

            /** Trigger weapon if attacking. */
            if (this.attacking && this.cooldown === 0) {
                this.weapon?.trigger(this);
            }
        }
    }

    public destroy(): void {
        this.alive = false;
        this.update.add("alive");
    }
};