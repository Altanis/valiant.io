export default interface AbilityDefinition {
    /** The name of the ability. */
    name: string;
    /** The cooldown of the ability, in seconds. */
    cooldown: number;
    /** The function which runs when the ability is triggered. */
    trigger(): void;
}