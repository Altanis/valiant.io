import PlayerHandler from "../../Handlers/PlayerHandler";
import { WeaponDefinition } from "./Definitions/WeaponDefinition";

export const Sword: WeaponDefinition = {
    name: "Sword",
    id: 0x00,
    type: "melee",
    rarity: "common",
    damage: 10,
    range: Math.PI / 4,
    speed: 25,
    cooldown: 20, // TODO(Altanis): Time this to perfection (make this how long it takes to finish one rot).
    trigger(player: PlayerHandler) {
        // player.cooldown += this.cooldown;
        // player.update.add("attacking");

        /** Check for initial attack. */
        /*if (!player.attack.cycles) {
            player.attack.cycles++;
            
            player.attack.oldAngle = player.angle;
            player.attack.direction = 1;
            console.log("values", player.angle, player.attack.direction, player.angle + player.attack.direction * Math.PI / 4);
            player.attack.nearestMP = player.angle + player.attack.direction * Math.PI / 4;
            
            if (player.attack.nearestMP > Math.PI * 2) player.attack.nearestMP += Math.PI / 4 - Math.PI * 2;

            // fix quadrant 3 (0 - 1.5 radians)

            console.log("found nearest mp", player.attack.nearestMP);
        }

        /** Traverse until reaching nearest midpoint. 
        player.angularVelocity += player.attack.direction! * this.speed;
        /** Check if the player has reached midpoint. 
        if (player.attack.direction! < 0 ? player.angle < player.attack.nearestMP! : player.angle > player.attack.nearestMP!) {
            console.log("execution?");
            if (++player.attack.cycles < 3) {
                player.attack.direction = -player.attack.direction!;
                player.attack.nearestMP = player.attack.oldAngle! + Math.abs(player.attack.direction! * Math.PI / 4);
                console.log("new MP 1", player.attack.nearestMP);
            } else if (player.attack.cycles === 3) {
                player.attack.direction = -player.attack.direction!;
                player.attack.nearestMP = player.attack.oldAngle!;
                console.log("new MP 2", player.attack.nearestMP);
            } else if (player.attack.cycles > 3) {
                player.attack.attacking = false;
                player.angle = player.attack.oldAngle!;
                player.attack.done = true;
                console.log("Attack was done?!");
            }
        }*/
    }
};