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
    Spawn = 0x00
};

export const Characters: CharacterDefinition[] = [
    Knight
];