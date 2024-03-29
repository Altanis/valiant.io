import Entity from "./_Entity";

export default class Box extends Entity {
    /** The dimensions of the box. */
    public dimensions = { width: 300, height: 300 };

    public name = "Box";

    public health = 100;
    public maxHealth = 100;

    render(
        ctx: CanvasRenderingContext2D,
        frame: number
    ) { 
        this.ticks++;

        const pos = this.lerpPosition(frame);
        const { width, height } = this.dimensions;

        ctx.fillStyle = "red";
        ctx.fillRect(pos.x, pos.y, width, height);
    }
};