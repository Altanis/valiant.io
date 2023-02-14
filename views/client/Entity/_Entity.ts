import { constrain, lerp } from "../Utils/Functions";

export default abstract class Entity {
    /** The ID of the entity. */
    public id = -1;

    /** The position of the entity. */
    public position = {
        current: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        /** The velocity of the player. */
        velocity: { 
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 }
        }
    };

    /** The angle of the entity. */
    public angle = {
        current: 0,
        target: 0,
        /** Interpolation factor. */
        factor: 0
    };
    
    /** The health of the entity. */
    public abstract health: number;
    /** The maximum health of the entity. */
    public abstract maxHealth: number;

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

        this.position.current.x = lerp(this.position.current.x, this.position.target.x, 0.1 * deltaTick);
        this.position.current.y = lerp(this.position.current.y, this.position.target.y, 0.1 * deltaTick);

        this.position.current.x = constrain(0, this.position.current.x, 14400);
        this.position.current.y = constrain(0, this.position.current.y, 14400);

        this.position.velocity.current.x = lerp(this.position.velocity.current.x, this.position.velocity.target.x, 0.1 * deltaTick);
        this.position.velocity.current.y = lerp(this.position.velocity.current.y, this.position.velocity.target.y, 0.1 * deltaTick);


        return this.position.current;
    }

    public render(...args: any) {};
};