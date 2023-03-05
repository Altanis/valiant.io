import Client from "../../Client";
import { Entities, Fields, Phases } from "../../Const/Enums";
import Box from "../../Entity/Box";
import Player from "../../Entity/Player";
import Entity from "../../Entity/_Entity";
import Logger from "../../Utils/Logger";
import Connection from "../Connection";
import SwiftStream from "../SwiftStream";

/** TODO(Altanis): Fix update for surroundings. */

export default class UpdateParser {
    /** The packet being handled. */
    private packet = new SwiftStream();
    /** The connection being represented. */
    private connection: Connection;
    /** THe client being represented. */
    private client: Client;
    /** The player being represented. */
    private player: Player;

    /** The map which parses fields. */
    /** @ts-ignore */
    public fieldMap: Map<number, (entity: Entity) => void> = new Map([
        [Fields.ID, (entity: Entity) => {
            const id = this.packet.ReadI8();

            entity.id = id;
        }],
        [Fields.Position, (entity: Entity) => {
            const x = this.packet.ReadFloat32();
            const y = this.packet.ReadFloat32();

            entity.position.target = { x, y };
        }],
        [Fields.Attacking, (entity: Player) => {
            const attacking = this.packet.ReadI8() === 0x01;

            entity.attack.attacking.change = attacking;
            if (!entity.attack.attacking.server && entity.attack.attacking.change)
                entity.attack.attacking.server = true;
        }],
        [Fields.Weapons, (entity: Player) => {
            const weapon = this.packet.ReadI8();
            entity.weapon = weapon;
        }],
        [Fields.FOV, (entity: Player) => {
            const fov = this.packet.ReadFloat32();
            entity.fov = fov;
        }],
        [Fields.Dimensions, (entity: Entity) => {
            const width = this.packet.ReadFloat32();
            const height = this.packet.ReadFloat32();

            entity.dimensions = { width, height };
        }],
        [Fields.Alive, (entity: Player) => {            
            const alive = this.packet.ReadI8() === 0x01;
            entity.alive = alive;
            
            if (entity.id !== this.player.id) return;
            if (alive) {
                entity.lastAlive = Date.now();
                this.client.canvas.phase = Phases.Arena;

                this.client.elements.homescreen.homescreen.style.display = "none";
                this.client.elements.arena.stats.style.display =
                    this.client.elements.arena.utils.style.display =
                    this.client.canvas.mapCanvas.style.display = "block";
            } else {
                const time = new Date(Date.now() - entity.lastAlive);
                const hours = time.getUTCHours().toString().padStart(2, '0');
                const minutes = time.getUTCMinutes().toString().padStart(2, '0');
                const seconds = time.getUTCSeconds().toString().padStart(2, '0');

                setTimeout(() => this.client.elements.arena.death.style.display = "flex", 250);
                this.client.elements.arena.killedBy.innerHTML = `You were killed by $ex.`;
                this.client.elements.arena.timeAlive.innerHTML = `Time Alive: ${hours}h ${minutes}m ${seconds}s`;
            }
        }],
        [Fields.Angle, (entity: Player) => {
            const angle = this.packet.ReadFloat32();
            entity.angle.target = angle;
        }],
        [Fields.Health, (entity: Player) => {
            const health = this.packet.ReadI8();
            entity.health = health;

            if (entity.id !== this.player.id) this.client.elements.update("health", health);
        }],
        [Fields.Armor, (entity: Player) => {
            const armor = this.packet.ReadI8();
            entity.armor = armor;
            
            if (entity.id !== this.player.id) this.client.elements.update("armor", armor);
        }],
        [Fields.Energy, (entity: Player) => {
            const energy = this.packet.ReadI8();
            entity.energy = energy;

            if (entity.id !== this.player.id) this.client.elements.update("energy", energy);
        }],
        [Fields.Name, (entity: Entity) => {
            const name = this.packet.ReadCString();
            entity.name = name;
        }],
    ]);

    constructor(connection: Connection) {
        this.connection = connection;
        this.client = connection.client;
        this.player = this.client.player;
    }

    public parse(packet: SwiftStream) {
        this.packet = packet;

        this.packet.ReadI8(); // Header

        const group = this.nextGroup();

        if (group === 0x00) {
            const fieldLength = this.packet.ReadI8();
            this.nextFields(fieldLength);
        }

        const surroundings = group !== 0x00 ? group : this.packet.ReadI8();
        
        if (surroundings === 0x01) {
            const entityLength = this.packet.ReadI8();
            this.nextEntities(entityLength);
        }

        this.player.surroundings = this.player.surroundings.filter(entity => entity.updated);
        this.player.surroundings.forEach(entity => entity.updated = false);
    }

    private nextGroup(): number {
        return this.packet.ReadI8();
    }

    private nextFields(length: number, entity?: Entity) {
        for (; length--;) {
            const field = this.packet.ReadI8();
            const executor = this.fieldMap.get(field);

            if (!executor) Logger.err(`Unknown field ${field}!`);
            else executor(entity || this.player);
        }
    }

    private nextEntities(length: number) {
        for (; length--;) {
            const entity = this.packet.ReadI8();
            const fieldLength = this.packet.ReadI8() - 1;

            const IDField = this.packet.ReadI8();
            const ID = this.packet.ReadI8();

            let _entity = this.player.surroundings.find(entity => entity.id === ID);
            if (!_entity) {
                switch (entity) {
                    case Entities.Player: _entity = new Player(); break;
                    case Entities.Box: _entity = new Box(); break;
                    default: Logger.err(`Unknown entity ${entity}!`);
                }

                _entity!.type = entity;
                _entity!.id = ID;
                this.player.surroundings.push(_entity!);
            }

            _entity!.updated = true;
            this.nextFields(fieldLength, _entity!);
        }
    }
}