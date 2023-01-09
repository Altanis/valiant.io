import CharacterDefinition from "./Definitions/CharacterDefinition";
import { DualWield } from "./Abilities";

/** The Knight, a character which serves as the average. */
export const Knight: CharacterDefinition = {
    name: "Knight",
    id: 0x00,
    speed: 15,
    stats: {
        maxHealth: 7,
        maxArmor: 6,
        maxManna: 100,
        maxSpeed: 100
    },
    abilities: [DualWield]
}