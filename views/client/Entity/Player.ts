import { ServerBound } from "../Const/Enums";
import CanvasManager from "../Rendering/CanvasManager";
import { lerp } from "../Utils/Functions";

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
        // Starting position is middle of arena.
        /** Position from one frame ago. */
        old: { x: 7200, y: 7200 },
        /** Position at current frame. */
        new: { x: 7200, y: 7200 },
        /** Smoothened position by lerp. */
        lerp: { x: 0, y: 0 },
    };
    /** The angle of the player. */
    public angle: number = 0;

    /** The time factor for the player. */
    private time = 0;

    /** Updates data of the player. */
    public update() {
        /** Updates position of the player smoothly. */
        this.time += 0.1; // Increments by 0.1 per frame, so 10 frames will yield real position.
        if (this.time > 1) {
            this.position.old = this.position.new;
            this.time = 0;
        }

        this.position.lerp = {
            x: lerp(this.position.old.x, this.position.new.x, this.time),
            y: lerp(this.position.old.y, this.position.new.y, this.time),
        };
    }

    /** Renders the player onto the canvas. */
    public render(manager: CanvasManager, ctx: CanvasRenderingContext2D) {
        /** Recognize keypresses. */
        if (manager.client.elements.activeKeys.size) {
            console.log(manager.client.elements.activeKeys);
            manager.client.connection.send(ServerBound.Movement, {
                keys: manager.client.elements.activeKeys
            });
        }

        const image = manager.ImageManager.get("Knight");
        if (!image) return;

        /** @ts-ignore */
        ctx.drawImage(image, this.position.lerp.x - 150, this.position.lerp.y - 150, 300, 300);
    }
}