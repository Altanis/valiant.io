import { Entities, Fields } from '../Const/Enums';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';
import Vector from '../Utils/Vector';
import Entity from './Entity';

/** A Box, an entity which blocks the player. Yields energy upon breakage. */
export class Box extends Entity {
    /** EntityType => CollisionEffect() */
    public static CollisionEffects: Map<string, (entity: Entity) => void> = new Map([
        ["Player", (player: Entity) => {
            player.velocity.add(new Vector(1000, 1000));
        }]
    ]);

    constructor(server: GameServer) {
        super(server, [300, 300], "Box");
        this.position = new Vector(0, 0);

        this.update.add("position");
        this.update.add("dimensions");
    }

    public tick() {
        super.tick();
    }
    
    /** Writes update information. */
    public write(buffer: SwiftStream) {
        buffer.WriteI8(Entities.Box);
        buffer.WriteI8(this.update.size + 1); // +1 for ID

        buffer.WriteI8(Fields.ID).WriteI8(this.id);

        this.update.forEach(property => {
            switch (property) {
                case "position": buffer.WriteI8(Fields.Position).WriteFloat32(this.position!.x).WriteFloat32(this.position!.y); break;
                case "dimensions": buffer.WriteI8(Fields.Dimensions).WriteFloat32(this.dimensions[0]).WriteFloat32(this.dimensions[1]); break;
            }
        });

        this.update.clear();
    }

    /** Collision effect with an entity. */
    public collide(entity: Entity) {
        Box.CollisionEffects.get(entity.type)!(entity);
    }
}