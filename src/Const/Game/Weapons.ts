import PlayerHandler from "../../Entities/PlayerHandler";
import { angleDistance } from "../../Utils/Functions";
import Vector from "../../Utils/Vector";
import { WeaponDefinition } from "./Definitions/WeaponDefinition";

export const Sword: WeaponDefinition = {
    name: "Rusty Blade",
    id: 0x00,
    type: "melee",
    rarity: "common",
    damage: 10,
    range: 200,
    speed: Math.PI / 2.6,
    cooldown: 20,
    trigger(player: PlayerHandler) {        
        for (const surrounding of player.surroundings) {
            const entity = player.server.entities[surrounding];
            if (!entity || surrounding === player.id) continue;

            const angleBetween = player.position.angle(entity.position);

            if (
                entity.dimensions[0] + this.range > player.position.distance(entity.position)
                && entity.dimensions[1] + this.range > player.position.distance(entity.position)
                && angleDistance(player.angle, angleBetween) < this.range
            )
            {
                entity.health -= this.damage;
                entity.update.add("health");
                entity.velocity.add(new Vector(Math.cos(angleBetween), Math.sin(angleBetween)).scale(500));
            }
        }

        player.cooldown += this.cooldown;
        player.update.add("attacking");
    }
};