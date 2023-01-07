import PlayerHandler from "../../Handlers/PlayerHandler";
import { WeaponDefinition } from "./Definitions/WeaponDefinition";

export const Sword: WeaponDefinition = {
    name: "Sword",
    id: 0x00,
    type: "melee",
    rarity: "common",
    damage: 10,
    range: 3,
    speed: 0.1,
    trigger(player: PlayerHandler) {
        const { attacking, direction } = player.attack;

        /** Check for initial attack. */
        if (!attacking) {
            player.attack.attacking = true;
            /** Calculate whether or not to go up or down. */
            player.attack.direction = Math.abs(player.angle - Math.PI / 2) < Math.abs(player.angle + Math.PI / 2) ? 1 : -1;
        }

        /** Add to angular momentum. */
        console.log("we'll be found deep underground.");
        if ((player.angle >= Math.PI / 2 && player.angle < Math.PI) || (player.angle <= -Math.PI / 2 && player.angle > -Math.PI))
            player.attack.direction *= -1;
        player.angularVelocity += direction * this.speed;
        console.log(player.angularVelocity);
    }
};