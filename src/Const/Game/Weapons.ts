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
        /** Check for initial attack. */
        if (!player.attack.attacking) {
            player.attack.attacking = true;

            player.attack.oldAngle = player.angle;
            player.attack.direction = Math.random() > 0.5 ? 1 : -1;
            player.attack.nearestMP = player.angle + player.attack.direction * Math.PI / 4;
        }

        /** Traverse until reaching nearest midpoint. */
        player.angularVelocity += player.attack.direction! * this.speed;
        /** Check if the player has reached midpoint. */
        if (player.attack.direction! < 0 ? player.angle < player.attack.nearestMP! : player.angle > player.attack.nearestMP!) {
            if (++player.attack.cycles < 2) {
                player.attack.direction = -player.attack.direction!;
                player.attack.nearestMP = player.attack.oldAngle! + player.attack.direction! * Math.PI / 4;
            } else if (player.attack.cycles === 2) {
                player.attack.direction = -player.attack.direction!;
                player.attack.nearestMP = player.attack.oldAngle!;
            } else if (player.attack.cycles > 2) {
                player.attack.attacking = false;
                player.angle = player.attack.oldAngle!;
                player.attack.done = true;
            }
        }
    }
};