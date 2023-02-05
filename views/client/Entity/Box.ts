import { lerp } from "../Utils/Functions";
import Entity from "./_Entity";

export default class Box extends Entity {
    /** The dimensions of the box. */
    public dimensions = { width: 300, height: 300 };

    render(
        ctx: CanvasRenderingContext2D,
        frame: number
    ) { 
        let pos: { x: number, y: number, ts: number };

        if (frame < this.position.old.ts) pos = this.position.old;
        else if (frame > this.position.new.ts) pos = this.position.new;
        else {
            pos = {
                x: lerp(this.position.old.x, this.position.new.x, 0.5),
                y: lerp(this.position.old.y, this.position.new.y, 0.5),
                ts: Date.now()
            }
        }

        const { width, height } = this.dimensions;

        ctx.fillStyle = "red";
        ctx.fillRect(pos.x, pos.y, width, height);
    }
};