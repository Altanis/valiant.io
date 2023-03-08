import PlayerHandler from "../../Entities/PlayerHandler";
import Vector from "../../Utils/Vector";
import { WeaponDefinition } from "./Definitions/WeaponDefinition";

export const Sword: WeaponDefinition = {
    name: "Rusty Blade",
    id: 0x00,
    type: "melee",
    rarity: "common",
    damage: 10,
    range: Math.PI / 4,
    speed: 30,
    cooldown: 20,
    trigger(player: PlayerHandler) {
        const attackVector = new Vector(Math.cos(player.angle) * this.range, Math.sin(player.angle) * this.range);
        const victims = player.server.SpatialHashGrid.query(
            player.position.x - this.range * 2,
            player.position.y - this.range * 2,
            this.range * 2,
            this.range * 2,
            player.id
        );

        // ensure angle correct and other stuff.

        player.cooldown += this.cooldown;
        player.update.add("attacking");
    }
};