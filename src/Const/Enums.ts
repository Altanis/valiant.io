import CharacterDefinition from "./Game/Definitions/CharacterDefinition";
import { WeaponDefinition } from "./Game/Definitions/WeaponDefinition";

import { Knight } from "./Game/Characters";
import { Sword } from "./Game/Weapons";

export enum CloseEvent {
    TooManyConnections  = 3000,
    ServerFilled        = 3001,
    InvalidProtocol     = 3002,
    Banned              = 3003,
    Unknown             = 3006
};

export enum ClientBound {
    /** Tells the client of it's surroundings. */
    Update = 0x00
};

/** Fields of the Update packet. */
export enum Fields {
    /** The position of the entity. */
    Position = 0x00,
    /** If the entity is attacking. */
    Attacking = 0x01
};

/** Movement codes. */
export enum Movement {
    Up = 0x01,
    Right = 0x02,
    Down = 0x03,
    Left = 0x04
};

export enum ServerBound {
    /** Client tells the server they want to spawn. [string(name), i8(characterIdx), i8(abilityIdx)] */
    Spawn = 0x00,
    /** Client tells the server they want to move. [i8(Movement)] */
    Movement = 0x01,
    /** The angle the player is facing, in radians. [f32(angle)] */
    Angle = 0x02,
    /** Client tells the server they want to attack. */
    Attack = 0x03
};

export const Characters: CharacterDefinition[] = [
    Knight
];

export const Weapons: WeaponDefinition[] = [
    Sword
];