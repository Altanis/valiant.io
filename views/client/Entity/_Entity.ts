import { lerp } from "../Utils/Functions";

export default class Entity {
    /** The ID of the entity. */
    public id = -1;

    /** The position of the entity. */
    public position = {
        /** Position from one frame ago. */
        current: { x: 0, y: 0 },
        /** Position at current frame. */
        target: { x: 0, y: 0 },
        /** The velocity of the player. */
        velocity: { x: 0, y: 0 }
    };

    /** Disable lerp for the entity (initial frame when seen). */
    public noLerp = true;
    /** If the entity was updated last tick. */
    public updated = false;

    /** The dimensions of the player. */
    public dimensions = { width: 0, height: 0 };

    /** Ticks since the entity was created. */
    public ticks = 0;

    public lerpPosition(deltaTick: number): { x: number, y: number } {
        if (this.ticks <= 2) return this.position.current = this.position.target;

        /** @ts-ignore */
        this.position.current.x = lerp(this.position.current.x, this.position.target.x, (window.starlight || 0.1) * deltaTick);
        /** @ts-ignore */
        this.position.current.y = lerp(this.position.current.y, this.position.target.y, (window.starlight || 0.1) * deltaTick);

        this.position.current.x += this.position.velocity.x;
        this.position.current.y += this.position.velocity.y;

        return this.position.current;
    }

    public render(...args: any) {};
};