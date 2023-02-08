import { lerp } from "../Utils/Functions";

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

    /** Disable lerp for the entity (initial frame when seen). */
    public noLerp = true;

    /** The dimensions of the player. */
    public dimensions = { width: 0, height: 0 };

    public lerpPosition(frame: number): { x: number, y: number, ts: number } {
        if (this.noLerp) return this.position.new;

        this.position.old.x = lerp(this.position.old.x, this.position.new.x, 0.05 * frame);
        this.position.old.y = lerp(this.position.old.y, this.position.new.y, 0.05 * frame);
        this.position.old.ts = Date.now();

        /*if (frame < this.position.old.ts) pos = this.position.old;
        else if (frame > this.position.new.ts) pos = this.position.new;
        else {
            pos = {
                x: lerp(this.position.old.x, this.position.new.x, 0.5),
                y: lerp(this.position.old.y, this.position.new.y, 0.5),
                ts: Date.now()
            }
        }*/

        return this.position.old;
    }

    public render(...args: any) {};
};