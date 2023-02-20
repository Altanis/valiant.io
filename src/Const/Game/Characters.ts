import CharacterDefinition from "./Definitions/CharacterDefinition";
import { DualWield } from "./Abilities";

/** The Knight, a character which serves as the average. */
export const Knight: CharacterDefinition = {
    name: "Knight",
    id: 0x00,
    speed: 5,
    stats: {
        health: 7,
        armor: 6,
        energy: 250,
    },
    abilities: [DualWield]
}