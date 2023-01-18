/** Representation of possible reasons the connection was closed. */
export enum CloseEvents {
    TooManyConnections  = 3000,
    ServerFilled        = 3001,
    InvalidProtocol     = 3002,
    Banned              = 3003,
    Unknown             = 3006
};

/** Representation of the phase canvas is rendering. */
export enum Phases {
    Homescreen = 0x00,
    Arena      = 0x01
};