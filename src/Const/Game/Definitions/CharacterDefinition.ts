import AbilityDefinition from "./AbilityDefinition";

export default interface CharacterDefinition {
    /** The name of the character. */
    name: string;
    /** The ID of the character. */
    id: number;
    /** The stats of the character. */
    stats: {
        /** The maximum health of the character. */
        health: number;
        /** The maximum amount of armor able to be damaged before losing health. */
        armor: number;
        /** The maximum energy of the character. */
        energy: number;
    };
    /** The speed of the player. */
    speed: number;
    /** The abilities of the character. */
    abilities: AbilityDefinition[];
}