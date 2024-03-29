import WebSocket from 'ws';
import { IncomingMessage } from "http";

import { ConnectionsPerIP } from '../Const/Config';
import { CloseEvent, ClientBound, ServerBound, Fields, Entities } from '../Const/Enums';
import CharacterDefinition from '../Const/Game/Definitions/CharacterDefinition';
import { WeaponDefinition } from '../Const/Game/Definitions/WeaponDefinition';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';

import Entity from './Entity';

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
    /** The entities surrounding the player. */
    public surroundings: number[] = [];
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

    public knockback = 1000;

    /** The mass of the player. */
    public mass = 100;
    
    /** Attack information for the player. */
    
    public attacking = false;
    public autoAttack = false;

    /** 
     * The field of vision of the client.
     * FOV of 1 -> (1881, 941); default FOV is 0.9.
    */
    public fov = 0.9; // TODO(Altanis): Let characters have different fovs.

    constructor(server: GameServer, id: number, request: IncomingMessage, socket: WebSocket) {
        super(server, [100, 100], "Player");

        this.server = server;
        this.id = id;
        console.log("WOW!", id);
        this.socket = socket;

        this.addHandlers(socket);
        
        this.ip = request.headers['x-forwarded-for']?.toString().split(',').at(-1) || request.socket.remoteAddress || "";
        this.ip && this.checkIP(request);

        /** Technical things to make modifying stats easier. */
        Object.defineProperty(this, "health", {
            get: () => this._health,
            set: (value: number) => {
                if (!this.character) return;

                const oA = this.armor, oH = this._health;
                value -= oH;

                if (value > 0) {
                    this._health = constrain(0, this._health + value, this.character!.stats.health);
                } else {
                    if (this.armor) {
                        const diff = this.armor + value;
                        this.armor = constrain(0, diff, this.character!.stats.armor);

                        if (diff < 0) {
                            this._health = constrain(0, this._health + (oA + value), this.character!.stats.health);
                        }

                    } else this._health = constrain(0, this._health + value, this.character!.stats.health);
                }

                if (this.armor !== oA) this.update.add("armor");
                if (this._health !== oH) this.update.add("health");

                return this._health;
            },
        });          
    }

    private addHandlers(socket: WebSocket): void {
        socket.on("close", () => this.close(CloseEvent.Unknown));
        socket.on("message", (b: ArrayBufferLike) => {
            const buffer = new Uint8Array(b);
            if (buffer.byteLength === 0) return socket.send(new Uint8Array(0)); // Ping packet.

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

        let sum = 1; // Account for self.
            
        this.server.players.forEach(player => {
            if (player.ip === this.ip) sum++;
        });

        if (sum > ConnectionsPerIP) {
            request.destroy(new Error("Threshold for maximum amount of connections has been exceeded."));
            return this.close(CloseEvent.TooManyConnections);
        }
    }

    /** Writes update data to a buffer. */
    public write(entity = this, surrounding = false) {
        /** Tells the client the amount of fields updated. */
        if (surrounding) this.SwiftStream.WriteI8(Entities.Player);
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
                case "name": this.SwiftStream.WriteI8(Fields.Name).WriteCString(entity.name); break;
            }
        });
    }

    /** Collision effect with an entity. */
    public collide(entity: Entity) {
        const noCollide = super.collide(entity);
        if (noCollide) return;

        this.server.physics.applyCollision(entity, this, 0.2);
    }

    /** Sends creation data of the player. */
    public SendUpdate() {        
        this.SwiftStream.WriteI8(ClientBound.Update);

        /** TODO(Altanis): Make each entity have a `write` method to update the client. */

        // TODO(Altanis): pretty sure querying is the only way to ensure collisions..
        /** Checks if the client requires a surrounding update. */
        const range = this.server.SpatialHashGrid.query(this.position!.x, this.position!.y, 4200 / this.fov, 2100 / this.fov, this.id, true);
        const collisions = this.server.SpatialHashGrid.query(this.position!.x, this.position!.y, this.dimensions[0], this.dimensions[1], this.id, false);

        /** Detect collisions. */
        for (const id of collisions) {
            const entity = this.server.entities[id];
            entity?.collide(this);
            this.SwiftStream.WriteI8(0xFF);
        }

        /** Checks if the client requires an update. */
        if (this.update.size) {
            /** Signifies a client update. */
            this.SwiftStream.WriteI8(0x00);
            /** Informs the client of what properties have changed. */
            this.write();
        }

        if (range.length) {
            this.SwiftStream.WriteI8(0x01).WriteI8(range.length);
            for (const id of range) {
                const entity = this.server.entities[id];
                /** @ts-ignore */
                if (entity instanceof PlayerHandler) this.write(entity, true);
                /** @ts-ignore */ 
                else entity?.write(this.SwiftStream);
            };
        }

        const buffer = this.SwiftStream.Write();
        if (buffer.byteLength > 1) this.socket.send(buffer);

        this.surroundings = range;
    }

    public close(reason: number) {
        // TODO(Altanis): Add to ban list.
        this.socket.close(reason);
        this.destroy();

        this.server.players.delete(this);
        this.server.entities[this.id] = undefined;
    }

    /** Tick-loop called by main game loop. */
    public tick(tick: number) {
        if (this.cooldown > 0) {
            if (--this.cooldown === 0) this.attacking = false;
        }

        if (this.alive) {
            super.tick(tick);

            /** Check if armor should be regenerated. */
            // tick & x represents an interval, where x + 1 is the interval.
            if (!(tick & 63)) { // Every 64 ticks, or roughly 1 second.
                if (this.character && this.armor < this.character.stats.armor) {
                    this.armor++;
                    this.update.add("armor");
                }
            }

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