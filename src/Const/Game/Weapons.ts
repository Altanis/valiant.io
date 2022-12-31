import { WeaponDefinition, WeaponType, RarityType } from "./Definitions/WeaponDefinition";

export class Sword implements WeaponDefinition {
    name = "Sword";
    id = 0x00;
    type: WeaponType = "melee";
    rarity: RarityType = "common";
    damage = 10;
    range = 1;
}