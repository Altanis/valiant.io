import CharacterDefinition from "./Game/Definitions/CharacterDefinition";
import { Knight } from "./Game/Characters";

export enum CloseEvent {
    TooManyConnections  = 3000,
    ServerFilled        = 3001,
    InvalidProtocol     = 3002,
    Banned              = 3003,
    Unknown             = 3006
};

export enum ClientBound {
    Update = 0x00
};

/** Fields of the Update packet. */
export enum Fields {
    /** The position of the entity. */
    Position = 0x00,
}

export enum ServerBound {
    /** Client tells the server they want to spawn. [string(name), i8(characterIdx), i8(abilityIdx)] */
    Spawn = 0x00
};

export const Characters: CharacterDefinition[] = [
    Knight
];