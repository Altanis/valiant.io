/** Representation of possible reasons the connection was closed. */
export const CloseEvents = {
    3000: "The server has detected multiple connections by you. Please terminate any existing connections.",
    3001: "The server is full.",
    3002: "The server has detected a malformed request made by you. Please refresh.",
    3003: "The server has detected that you are a banned player.",
    3006: "An unknown error has occurred. Please refresh."
}

/** Representation of the phase canvas is rendering. */
export enum Phases {
    Homescreen = 0x00,
    Arena      = 0x01
};

export enum ClientBound {
    /** Tells the client of it's surroundings. */
    Update = 0x00
};

export enum ServerBound {
    /** Client tells the server they want to spawn. [string(name), i8(characterIdx), i8(abilityIdx)] */
    Spawn     = 0x00,
    /** Client tells the server they want to move. [i8(Movement)] */
    Movement  = 0x01,
    /** The angle the player is facing, in radians. [f32(angle)] */
    Angle     = 0x02,
    /** Client tells the server they want to attack. */
    Attack = 0x03,
    
    /** Client cheats (when given developer code). */
    Cheats    = 0xFF
};

/** Fields of the Update packet. */
export enum Fields {
    /** The ID of the entity. */
    ID         = 0x00,
    /** The position of the entity. */
    Position   = 0x01,
    /** If the entity is attacking. */
    Attacking  = 0x02,
    /** The weapon(s) of the player. */
    Weapons    = 0x03,
    /** The resolution (FoV) of the entity. */
    FOV        = 0x04,
    /** The dimensions of the entity. */
    Dimensions = 0x05,
    /** Whether or not the entity is alive. */
    Alive      = 0x06,
    /** The angle of the entity. */
    Angle      = 0x07,
    /** The health of the entity. */
    Health     = 0x08,
    /** The armor of the entity. */
    Armor      = 0x09,
    /** The energy of the entity. */
    Energy     = 0x0A,
    /** The name of the entity. */
    Name       = 0x0B,
};

/** Object types. */
export enum Entities {
    Player  = 0x00,
    Box     = 0x01
} 

/** Movement codes. */
export enum Movement {
    Up     = 0x01,
    Right  = 0x02,
    Down   = 0x03,
    Left   = 0x04
};