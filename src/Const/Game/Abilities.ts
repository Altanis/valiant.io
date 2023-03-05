import AbilityDefinition from "./Definitions/AbilityDefinition";

/** This ability allows you to equip the same weapon twice. */
export const DualWield: AbilityDefinition = {
    name: "Slash",
    cooldown: 10,

    trigger() {}
}

/** This ability allows you to charge at someone until you hit an opponent. */
export const Charge: AbilityDefinition = {
    name: "Charge",
    cooldown: 30,

    trigger() {},
}