/** Characters and all their necessary clientside data. */
const Characters = [
    /** Knight */
    {
        name: "Knight",
        stats: {
            health: 7,
            armor: 6,
            energy: 250
        },
        abilities: [0, 1],
        src: "Knight.gif",
        speed: 5,
    },
    {
        name: "Priest",
        stats: {
            health: 7,
            armor: 6,
            energy: 300
        },
        abilities: [1],
        src: "Priest.gif",
        speed: 5,
    }
];

/** Abilities, a specific property of characters. */
const Abilities = [
    /** Dual Wield */
    {
        name: "Dual Wield",
        description: "Attack with double the power.",
        src: "dual_wield.png",
    },
    /** Charge */
    {
        name: "Charge",
        description: "Bash into a foe with your shield.",
        src: "charge.png",
    }
];

/** Weapons, objects used to attack. */
const Weapons = [
    /** Rusty Blade */
    {
        name: "Rusty Blade",
        type: "melee",
        rarity: "common",
        damage: 10,
        rotation: Math.PI / 4,
        speed: 30,
        src: "blade",
        offsetX: -10,
        offsetY: -150,
        width: 300,
        height: 400,
        id: 0x00,
        range: 200,
        cooldown: 20,
    }
];

export { Characters, Abilities, Weapons };