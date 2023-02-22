import { Characters, Weapons } from "../Const/Definitions";
import CanvasManager from "../Rendering/CanvasManager";
import { ARENA_SIZE } from "../Utils/Config";
import Entity from "./_Entity";

/** A representation of a Player entity. */
export default class Player extends Entity {
    /** The character index of the player. */
    public character = 0;
    /** The ability index of the player. */
    public ability = 0;
    /** The weapon the player is holding. */
    public weapon = 0;
    /** If the player is alive. */
    public alive = false;
    /** The dimensions of the player. */
    public dimensions = { width: 300, height: 300 };

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

    /** The field of vision of the player. */
    public fov = 0.9;
    /** The entities surrounding the player. */
    public surroundings: Entity[] = [];

    /** The maximum health of the player. */
    public get maxHealth(): number {
        return Characters[this.character].stats.health;
    };
    /** The health of the player. */
    public health = this.maxHealth;

    /** The maximum armor of the player. */
    public get maxArmor(): number {
        return Characters[this.character].stats.armor;
    };
    /** The armor of the player. */
    public armor = this.maxArmor;

    /** The maximum energy of the player. */
    public get maxEnergy(): number {
        return Characters[this.character].stats.energy;
    };
    /** The energy of the player. */
    public energy = this.maxEnergy;

    /** Private rendering utils for bars. */
    private healthWidth = this.health;
    private armorWidth = this.armor;
    private energyWidth = this.energy;

    /** Death animation information for the character. */
    private deathAnim = {
        phase: 0, // 0 = not dead, 1 = dying, 2 = dead

        size: this.dimensions.height,
        targetSize: this.dimensions.height * 1.5,

        transparency: 0,
        targetTransparency: 1,

        ticks: 0,
        targetTicks: 30
    };

    /** Renders the player onto the canvas. */
    public render(
        manager: CanvasManager,
        ctx: CanvasRenderingContext2D,
        position: { x: number, y: number },
        angle: number
    ) {
        this.ticks++;

        if (!this.alive && this.deathAnim.phase === 0) this.destroy(manager, position);
        else if (this.deathAnim.phase === 1) this.destroy(manager, position);
        
        if (!this.alive) return;

        const c = Characters[this.character];
        const w = Weapons[this.weapon];

        if (angle > Math.PI) angle = Math.PI - 0.01;
        else if (angle < -Math.PI) angle = -Math.PI + 0.01;

        const scaleX = (angle > Math.PI / 2 && angle < Math.PI) || (angle < -Math.PI / 2 && angle > -Math.PI) ? -1 : 1; // TODO(Altanis): Fix for attacking.
        ctx.translate(position.x, position.y);

        this.renderBars(ctx, manager);

        ctx.scale(scaleX, 1);

        /** Render character. */
        const character = manager.ImageManager.get(`img/characters/frames/${c.name}/${c.name}`, true);
        if (!character) return;

        ctx.drawImage(character, -150, -150, this.dimensions.width, this.dimensions.height);

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

        // TODO(Altanis): Create a blue tracer to illustrate the path of the sword.

        ctx.restore();

        /** Render position on the minimap. */
        manager.mapCtx.fillStyle = "#FFFFFF";

        const minimapX = position.x * manager.mapCanvas.width / ARENA_SIZE;
        const minimapY = position.y * manager.mapCanvas.height / ARENA_SIZE;

        manager.drawCircle(minimapX, minimapY, 2, manager.mapCtx);
    }

    public destroy(manager: CanvasManager, position: { x: number, y: number }) {
        this.deathAnim.phase = 1;

        const size = this.deathAnim.size + (((this.deathAnim.targetSize - this.deathAnim.size) / this.deathAnim.targetTicks) * this.deathAnim.ticks);
        const transparency = ((this.deathAnim.targetTransparency - this.deathAnim.transparency) / this.deathAnim.targetTicks) * this.deathAnim.ticks;

        console.log(size, 1 - transparency);

        const c = Characters[this.character];
        const character = manager.ImageManager.get(`img/characters/frames/${c.name}/${c.name}`, true);
        if (!character) return;

        /** Set transparency of drawImage. */
        manager.ctx.save();
        manager.ctx.translate(position.x, position.y);
        manager.ctx.globalAlpha = 1 - transparency;
        manager.ctx.drawImage(character, -(size / 2), -(size / 2), size, size);
        manager.ctx.restore();

        if (++this.deathAnim.ticks >= this.deathAnim.targetTicks) this.deathAnim.phase = 2;
    }

    private renderBars(ctx: CanvasRenderingContext2D, manager: CanvasManager) {
        /** Render health bar. */
        if (this.health !== this.healthWidth) {
            this.healthWidth += this.healthWidth < this.health ? 0.2 : -0.2;
            // TODO(Altanis): Ensure they collide at some point.
            if (this.healthWidth < this.health ? 
                this.healthWidth > this.health :
                this.healthWidth < this.health
            ) this.healthWidth = this.health;
        }

        ctx.fillStyle = "#3d3f43";
        manager.roundRect(-85, 200, 200, 20, 8);
        ctx.fillStyle = "#FD3B3B"; // opponent is #cc5152
        manager.roundRect(-85, 200, 200 * (this.healthWidth / this.maxHealth), 20, 7);

        /** Render armor bar. */
        if (this.armor !== this.armorWidth) {
            this.armorWidth += this.armorWidth < this.armor ? 0.2 : -0.2;
            // TODO(Altanis): Ensure they collide at some point.
            if (this.armorWidth < this.armor ?
                this.armorWidth > this.armor :
                this.armorWidth < this.armor
            ) this.armorWidth = this.armor;
        }

        ctx.fillStyle = "#3d3f43";
        manager.roundRect(-85, 225, 200, 20, 8);
        ctx.fillStyle = "#A8D657"; // opponent is #cc5152
        manager.roundRect(-85, 225, 200 * (this.armorWidth / this.maxArmor), 20, 7);
        
        /** Render energy bar. */
        if (this.energy !== this.energyWidth) {
            this.energyWidth += this.energyWidth < this.energy ? 0.2 : -0.2;
            // TODO(Altanis): Ensure they collide at some point.
            if (this.energyWidth < this.energy ?
                this.energyWidth > this.energy :
                this.energyWidth < this.energy
            ) this.energyWidth = this.energy;
        }

        ctx.fillStyle = "#3d3f43";
        manager.roundRect(-85, 250, 200, 20, 8);
        ctx.fillStyle = "#7300FF"; // opponent is #cc5152
        manager.roundRect(-85, 250, 200 * (this.energyWidth / this.maxEnergy), 20, 7);
        /*ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`${this.health}/${this.maxHealth}`, 0, 215);
        ctx.fillText(`${this.armor}/${this.maxArmor}`, 0, 240);
        ctx.fillText(`${this.energy}/${this.maxEnergy}`, 0, 265);*/
    }
}