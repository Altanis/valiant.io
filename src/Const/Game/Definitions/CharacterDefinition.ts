import AbilityDefinition from "./AbilityDefinition";

export default interface CharacterDefinition {
    /** The name of the character. */
    name: string;
    /** The ID of the character. */
    id: number;
    /** The stats of the character. */
    stats: {
        /** The maximum health of the character. */
        maxHealth: number;
        /** The maximum amount of armor able to be damaged before losing health. */
        maxArmor: number;
        /** The maximum manna of the character. */
        maxManna: number;
        /** The maximum speed of the character. */
        maxSpeed: number;
    };
    /** The abilities of the character. */
    abilities: AbilityDefinition[];
}