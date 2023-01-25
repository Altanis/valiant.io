import { Characters, Weapons } from "../Const/Definitions";
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
        old: { x: 7200, y: 7200, ts: 0 },
        /** Position at current frame. */
        new: { x: 7200, y: 7200, ts: 0 },
    };
    /** The angle of the player. */
    public angle = {
        /** Angle from one frame ago. */
        old: 0,
        /** Angle at current frame. */
        new: 0,
        /** Interpolation factor. */
        factor: 0
    };

    /** Renders the player onto the canvas. */
    public render(manager: CanvasManager, ctx: CanvasRenderingContext2D, position: { x: number, y: number }) {
        const c = Characters[this.character];
        const w = Weapons[this.weapon];

        /** Render character. */
        const character = manager.ImageManager.get(`img/characters/frames/${c.name}/${c.name}`, true);
        if (!character) return;

        ctx.drawImage(character, position.x - 150, position.y - 150, 300, 300);

        /** Render weapon. */
        const weapon = manager.ImageManager.get(`img/weapons/${w.src}`);
        if (!weapon) return;

        ctx.drawImage(weapon, position.x, position.y + w.offset, 200, 40);
    }
}