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
    /** The range of attack.
     * Melee: Weapon goes down 1 radian, and attacks whatever is within <range>.
     */
    range: number;
}