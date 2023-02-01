export default class Entity {
    /** The ID of the entity. */
    public id = -1;

    /** The position of the entity. */
    public position = {
        /** Position from one frame ago. */
        old: { x: 0, y: 0, ts: 0 },
        /** Position at current frame. */
        new: { x: 0, y: 0, ts: 0 },
    };

    /** The dimensions of the player. */
    public dimensions = { width: 0, height: 0 };

    public render(...args: any) {};
};