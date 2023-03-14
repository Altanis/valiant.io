import { Entities, Fields } from '../Const/Enums';

import GameServer from '../GameServer';
import SwiftStream from '../Utils/SwiftStream';
import Vector from '../Utils/Vector';
import Entity from './Entity';
import PlayerHandler from './PlayerHandler';

/** A Box, an entity which blocks the player. Yields energy upon breakage. */
export class Box extends Entity {
    /** EntityType => CollisionEffect() */
    /** @ts-ignore */
    public CollisionEffects: Map<string, (entity: Entity) => void> = new Map([
        ["Player", (player: PlayerHandler) => {
            player.health -= 1;
            player.server.physics.applyCollision(player, this, 0.1);
        }]
    ]);

    public alive = true;
    public mass = 200;
    public knockback = 0;

    constructor(server: GameServer) {
        super(server, [300, 300], "Box");
        this.position = new Vector(0, 0);

        this.update.add("position");
        this.update.add("dimensions");
    }

    public tick(tick: number) {
        super.tick(tick);
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
    }

    /** Collision effect with an entity. */
    public collide(entity: Entity) {
        const noCollide = super.collide(entity);
        if (noCollide) return;

        this.CollisionEffects.get(entity.type)!(entity);
    }
}