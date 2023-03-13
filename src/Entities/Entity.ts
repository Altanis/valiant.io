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
    /** 
    * The angle at which the player is facing.
    * Measured in radians, with range of [-Math.PI, Math.PI].
    */
    public angle: number = Math.PI;
    /** The mass of the entity. */
    public mass = 0;
    /** Whether or not the entity is alive. */
    public alive = false;

    /** The health of the entity. */
    public health = 1;
    /** Knockback applied during collision. */
    public knockback = 0;
    
    /** Entities collided with. */
    public collided: number[] = [];

    constructor(server: GameServer, dimensions: number[], type: EntityType) {
        this.server = server;
        this.id = server.entities.length;
        this.type = type;

        if (dimensions.length !== 2) throw new Error("Could not construct Entity: Malformed dimensions.");
        this.dimensions = dimensions;
    }

    /** Gets the center of the entity's hitbox. */
    public get center(): Vector {
        return new Vector(this.position.x + this.dimensions[0] / 2, this.position.y + this.dimensions[1] / 2);
    }

    public tick() {
        if (this.health <= 0) this.destroy();

        if (this.velocity.x !== 0 || this.velocity.y !== 0) this.update.add("position");
        this.server.physics.applyFriction(this);
        this.position!.add(this.velocity!, true);
        this.velocity!.x = this.velocity!.y = 0;
    }

    /** Returns true to signify collision should not be invoked. */
    public collide(entity: Entity): boolean | void {
        if (this.collided.includes(entity.id) || entity.collided.includes(this.id)) {
            entity.collided.splice(entity.collided.indexOf(this.id), 1);
            this.collided.splice(this.collided.indexOf(entity.id), 1);

            return true;
        }

        this.collided.push(entity.id);
        entity.collided.push(this.id);
    };

    public destroy(): void { };
}