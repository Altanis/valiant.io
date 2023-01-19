// import Vector from "../Utils/Vector";

/** A representation of a Player entity. */
export default class Player {
    /** The character index of the player. */
    public character = 0;
    /** The ability index of the player. */
    public ability = 0;
    /** The weapon the player is holding. */
    public weapon = 0;

    /** The ID of the player. */
    public id = 0;
    /** The position of the player. */
    public position = {
        /** Position from one frame ago. */
        old: { x: 0, y: 0 },
        /** Position at current frame. */
        new: { x: 0, y: 0 }
    };
    /** The angle of the player. */
    public angle: number = 0;
}