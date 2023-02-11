import GameServer from '../GameServer';
import Vector from '../Utils/Vector';
type EntityType = "Player" | "Box";

/** The base for any entity ingame. */
export default class Entity {
    /** The server the entity is in. */
    public server: GameServer;
    /** The ID of the entity. */
    public id: number;
    /** The type of entity. */
    public type: string;
    /** The position of the entity. */
    public position: Vector = new Vector(0, 0);
    /** The velocity of the entity. */
    public velocity: Vector = new Vector(0, 0);
    /** The dimensions of the entity. */
    public dimensions: number[];
    /** Whether or not the entity needs to be force updated. A set of properties is given. */
    public update: Set<string> = new Set();

    constructor(server: GameServer, dimensions: number[], type: EntityType) {
        this.server = server;
        this.id = server.entities.length;
        this.type = type;

        if (dimensions.length !== 2) throw new Error("Could not construct Entity: Malformed dimensions.");
        this.dimensions = dimensions;
    }

    public tick() {
        this.position!.add(this.velocity!, true);
                
        /** Reinsert into hashgrid with updated position. */
        this.server.SpatialHashGrid.insert(this.position!.x, this.position!.y, this.dimensions[0], this.dimensions[1], this.id);
    }
}