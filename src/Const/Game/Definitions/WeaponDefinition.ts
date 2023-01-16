import PlayerHandler from "../../../Entities/PlayerHandler";

export type WeaponType = "laser" | "melee" | "projectile";
export type RarityType = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export interface WeaponDefinition {
    /** The name of the weapon. */
    name: string;
    /** The ID of the weapon. */
    id: number;
    /** The type of the weapon. */
    type: WeaponType;
    /** The rarity of the weapon. */
    rarity: RarityType;
    /** The base damage of the weapon. */
    damage: number;
    /** The cooldown of the weapon (in ticks). */
    cooldown: number;
    
    /** The range of attack.
     * Melee: Weapon goes down 1 radian, and attacks whatever is within <range>.
     */
    range: number;
    /**
     * The speed of the attack.
     * Melee: How fast it moves up/down (in radians per tick, or 40ms).
     */
    speed: number;
    /** The function ran when triggered. */
    trigger(player: PlayerHandler): void;
}