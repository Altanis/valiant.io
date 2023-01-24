import GameServer from '../GameServer';
import Vector from '../Utils/Vector';
import Entity from './Entity';

/** A Box, an entity which blocks the player. Yields energy upon breakage. */
export class Box extends Entity {
    constructor(server: GameServer) {
        super(server, [50, 50], "Box");
        this.position = new Vector(14400, 14400);
    }

    public tick() {
        super.tick();
    }
}