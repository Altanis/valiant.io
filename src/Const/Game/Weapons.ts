import PlayerHandler from "../../Handlers/PlayerHandler";
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
        player.cooldown += this.cooldown;
        player.update.add("attacking");
    }
};