import GameServer from '../GameServer';
import Vector from '../Utils/Vector';
import PlayerHandler from './PlayerHandler';
type EntityType = "Player" | "Box";

/** The base for any entity ingame. */
export default class Entity {
    /** The server the entity is in. */
    public server: GameServer;
    /** The ID of the entity. */
    public id: number;
    /** The type of entity. */
    public type: EntityType;
    /** The position of the entity. */
    public position: Vector = new Vector(0, 0);
    /** The velocity of the entity. */
    public velocity: Vector = new Vector(0, 0);
    /** The dimensions of the entity. */
    public dimensions: number[];
    /** Whether or not the entity needs to be force updated. A set of properties is given. */
    public update: Set<string> = new Set();
    /** The mass of the entity. */
    public mass = 0;
    /** Whether or not the entity is alive. */
    public alive = true;

    /** The health of the entity. */
    public health = 1;

    constructor(server: GameServer, dimensions: number[], type: EntityType) {
        this.server = server;
        this.id = server.entities.length;
        this.type = type;

        if (dimensions.length !== 2) throw new Error("Could not construct Entity: Malformed dimensions.");
        this.dimensions = dimensions;
    }

    public tick() {
        if (this.health <= 0) this.destroy();

        if (this.velocity.x !== 0 || this.velocity.y !== 0) this.update.add("position");
        this.server.physics.applyFriction(this);
        this.position!.add(this.velocity!, true);
        this.velocity!.x = this.velocity!.y = 0;
    }

    public collide(entity: Entity): void { };
    public destroy(): void { };
}