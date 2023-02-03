import { Entities, Fields } from '../Const/Enums';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';
import Vector from '../Utils/Vector';
import Entity from './Entity';

/** A Box, an entity which blocks the player. Yields energy upon breakage. */
export class Box extends Entity {
    constructor(server: GameServer) {
        super(server, [300, 300], "Box");
        this.position = new Vector(0, 0);

        this.update.add("id");
        this.update.add("position");
        this.update.add("dimensions");
    }

    public tick() {
        super.tick();
    }
    
    /** Writes update information. */
    public write(buffer: SwiftStream) {
        buffer.WriteI8(Entities.Box);
        buffer.WriteI8(this.update.size);

        this.update.forEach(property => {
            switch (property) {
                case "id": buffer.WriteI8(Fields.ID).WriteI8(this.id); break;
                case "position": buffer.WriteI8(Fields.Position).WriteFloat32(this.position!.x).WriteFloat32(this.position!.y); break;
                case "dimensions": buffer.WriteI8(Fields.Dimensions).WriteI8(this.dimensions[0]).WriteI8(this.dimensions[1]); break;
            }
        });

        this.update.clear();
    }
}