import PlayerHandler from "../../Entities/PlayerHandler";
import Vector from "../../Utils/Vector";
import { WeaponDefinition } from "./Definitions/WeaponDefinition";

export const Sword: WeaponDefinition = {
    name: "Rusty Blade",
    id: 0x00,
    type: "melee",
    rarity: "common",
    damage: 10,
    range: 200,
    speed: 30,
    cooldown: 20,
    trigger(player: PlayerHandler) {        
        const attack = new Vector(Math.cos(player.angle) * this.range, Math.sin(player.angle) * this.range);
        console.log(
            Math.max(0, player.position.x - attack.x),
            Math.max(0, player.position.y - attack.y),
            Math.abs(attack.x * 2),
            Math.abs(attack.y * 2),
            player.id
        );
        const victims = player.server.SpatialHashGrid.query(
            Math.max(0, player.position.x - attack.x),
            Math.max(0, player.position.y - attack.y),
            Math.abs(attack.x * 2),
            Math.abs(attack.y * 2),
            player.id
        );

        console.log("victims", victims);

        // TODO(Altanis): Fix collision detection.
        for (const victim of victims) {
            const entity = player.server.entities[victim];
            /** Ensure the victim was actually hit by the weapon. */
            const dx = entity.position.x - player.position.x;
            const dy = entity.position.y - player.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            let angleDifference = Math.abs(angle - player.angle);
            angleDifference = Math.min(angleDifference, Math.PI * 2 - angleDifference);

            if (distance <= this.range && angleDifference <= this.range / 2) {
                entity.health -= this.damage;
                entity.update.add("health");
                entity.velocity.add(new Vector(Math.cos(angle), Math.sin(angle)).scale(500));
            }
        }

        // ensure angle correct and other stuff.

        player.cooldown += this.cooldown;
        player.update.add("attacking");
    }
};