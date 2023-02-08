import { lerp } from "../Utils/Functions";

export default class Entity {
    /** The ID of the entity. */
    public id = -1;

    /** The position of the entity. */
    public position = {
        /** Position from one frame ago. */
        current: { x: 0, y: 0, ts: 0 },
        /** Position at current frame. */
        target: { x: 0, y: 0, ts: 0 },
    };

    /** Disable lerp for the entity (initial frame when seen). */
    public noLerp = true;
    /** If the entity was updated last tick. */
    public updated = false;

    /** The dimensions of the player. */
    public dimensions = { width: 0, height: 0 };

    public lerpPosition(deltaTick: number): { x: number, y: number, ts: number } {
        if (this.noLerp) return this.position.current = this.position.target;

        this.position.current.x = lerp(this.position.current.x, this.position.target.x, 0.05 * deltaTick);
        this.position.current.y = lerp(this.position.current.y, this.position.target.y, 0.05 * deltaTick);
        this.position.current.ts = Date.now();

        return this.position.current;
    }

    public render(...args: any) {};
};