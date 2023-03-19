import { constrain, lerp, lerpAngle } from "../Utils/Functions";
import { ARENA_SIZE } from "../Utils/Config";
import CanvasManager from "../Interface/CanvasManager";

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

    /** The name of the entity. */
    public name = "";
    
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

    /** The type of entity. */
    public type = 0;

    /** If the entity is alive. */
    public alive: boolean | null = true;

    public lerpPosition(deltaTick: number): { x: number, y: number } {
        if (this.ticks <= 2) return this.position.current = this.position.target;

        this.position.current.x = lerp(this.position.current.x, this.position.target.x, 0.1 * deltaTick);
        this.position.current.y = lerp(this.position.current.y, this.position.target.y, 0.1 * deltaTick);

        this.position.current.x = constrain(0, this.position.current.x, ARENA_SIZE);
        this.position.current.y = constrain(0, this.position.current.y, ARENA_SIZE);

        /** @ts-ignore */
        this.position.velocity.current.x = lerp(this.position.velocity.current.x, this.position.velocity.target.x, 0.01 * deltaTick);
        /** @ts-ignore */
        this.position.velocity.current.y = lerp(this.position.velocity.current.y, this.position.velocity.target.y, 0.01 * deltaTick);


        return this.position.current;
    }

    public lerpAngle(deltaTIck: number): number {
        if (this.ticks <= 2) return this.angle.current = this.angle.target;
        
        this.angle.current = lerpAngle(this.angle.current, this.angle.target, 0.35 * deltaTIck);
        this.angle.current = constrain(-Math.PI, this.angle.current, Math.PI);

        return this.angle.current;
    }

    public render(...args: any) { };
    public destroy(manager: CanvasManager, ...args: any) { };
};