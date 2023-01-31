import { Characters, Weapons } from "../Const/Definitions";
import CanvasManager from "../Rendering/CanvasManager";
import { TAU } from "../Utils/Functions";

/** A representation of a Player entity. */
export default class Player {
    /** The character index of the player. */
    public character = 0;
    /** The ability index of the player. */
    public ability = 0;
    /** The weapon the player is holding. */
    public weapon = 0;
    /** If the player is alive. */
    public alive = false;

    /** The ID of the player. */
    public id = 0;
    /** The position of the player. */
    public position = {
        // Starting position is middle of arena.
        /** Position from one frame ago. */
        old: { x: 0, y: 0, ts: 0 },
        /** Position at current frame. */
        new: { x: 0, y: 0, ts: 0 },
    };
    /** The angle of the player. */
    public angle = {
        /** Angle from one frame ago. */
        old: {
            ts: 0,
            measure: 0
        },
        /** Angle at current frame. */
        new: {
            ts: 0,
            measure: 0
        },
        /** Interpolation factor. */
        factor: 0
    };

    /** Attack information of the player. */
    public attack = {
        /** Whether or not the player is attacking. */
        attacking: {
            /** The client-side state. */
            client: false,
            /** The server-side state. */
            server: false,
            /** Whether or not to change state. */
            change: false
        },
        /** The direction of angle movement. */
        direction: 1,
        /** The mouse angle when attacking. */
        mouse: 0,
        /** The lerp factor at which the mouse should go in between [posRange, negRange]. */
        lerpFactor: 0,
        /** The amount of times the direction has been reversed. */
        cycles: 0
    };

    /** Renders the player onto the canvas. */
    public render(
        manager: CanvasManager,
        ctx: CanvasRenderingContext2D,
        position: { x: number, y: number },
        angle: number
    ) {
        const c = Characters[this.character];
        const w = Weapons[this.weapon];

        if (angle > Math.PI) angle = Math.PI - 0.01;
        else if (angle < -Math.PI) angle = -Math.PI + 0.01;

        const scaleX = (angle > Math.PI / 2 && angle < Math.PI) || (angle < -Math.PI / 2 && angle > -Math.PI) ? -1 : 1; // TODO(Altanis): Fix for attacking.
        ctx.translate(position.x, position.y);
        ctx.scale(scaleX, 1);

        /** Render character. */
        const character = manager.ImageManager.get(`img/characters/frames/${c.name}/${c.name}`, true);
        if (!character) return;

        ctx.drawImage(character, -150, -150, 300, 300);

        /** Render weapon. */
        const weapon = manager.ImageManager.get(`img/weapons/${w.src}`);
        if (!weapon) return;
        
        if (scaleX === -1) {
            if (angle > -Math.PI / 2 && angle < Math.PI) {
                angle = Math.PI - angle;
            } else if (angle < -Math.PI / 2 && angle > -Math.PI) {
                angle = Math.abs(angle + (Math.PI / 2)) - (Math.PI / 2);
            }
        }
        
        ctx.rotate(angle);
        ctx.drawImage(weapon, w.offsetX, w.offsetY, 200, 40);
        ctx.restore();

        /** Render position on the minimap. */
        manager.mapCtx.fillStyle = "#FFFFFF";

        const minimapX = position.x * manager.mapCanvas.width / 14400;
        const minimapY = position.y * manager.mapCanvas.height / 14400;

        manager.drawCircle(minimapX, minimapY, 2, manager.mapCtx);
    }
}