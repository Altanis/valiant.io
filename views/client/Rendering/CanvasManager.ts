import Client from "../Client";
import { Phases, ServerBound } from "../Const/Enums";
import { lerp, lerpAngle, randomRange } from "../Utils/Functions";
import ImageManager from "./ImageManager";

/** Constant for 360 degrees in radians. */
const TAU = Math.PI * 2;
/** Psuedorandom number in between two ranges. */

/** The canvas where nearly all visual representation is drawn. */
export default class CanvasManager {
    /** The canvas element. */
    /** @ts-ignore */
    public canvas: HTMLCanvasElement = document.getElementById("canvas")!;
    /** The context to draw on. */
    public ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

    /** MAP CANVAS */
    /** The canvas which represents the minimap. */
    /** @ts-ignore */
    public mapCanvas: HTMLCanvasElement = document.getElementById("mapDisplay")!;
    /** The context to draw on for the minimap. */
    public mapCtx: CanvasRenderingContext2D = this.mapCanvas.getContext("2d")!;

    /** The client which needs relative rendering. */
    public client: Client;

    /** The phase in which rendering is occuring. */
    public phase = Phases.Homescreen; 
    /** The difference in between two frame renders. */
    private delta = 0;
    /** The variable which keeps track of the last update. */
    private lastUpdate = 0;
    /** The object which tracks FPS. */
    private FPS = {
        fps: [0]
    };    

    /** Manager for images. */
    public ImageManager = new ImageManager();

    /** The stars on the homescreen. */
    public stars: {
        count: number,
        stars: {
            x: number,
            y: number,
            radius: number
        }[],
        radiusIncrement: number
    } = {
            count: 200,
            stars: [],
            radiusIncrement: 0.1
        };
    
    constructor(client: Client) {
        this.client = client;
    }

    public render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);

        this.delta = Date.now() - this.lastUpdate;
        this.lastUpdate = Date.now();

        switch (this.phase) {
            case Phases.Homescreen: this.Homescreen(); break;
            case Phases.Arena: this.Arena(this.delta); break;
        }
    }

    /** UTILITIES */
    public drawCircle(x: number, y: number, r: number, ctx = this.ctx) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
    }

    /** Renders the homescreen background (with pulsating stars). */
    private Homescreen() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#FFFFFF";
        for (let i = this.stars.count - this.stars.stars.length; --i;) {
            this.stars.stars.push({
                x: randomRange(0, this.canvas.width),
                y: randomRange(0, this.canvas.width),
                radius: randomRange(0.1, 1.5),
            });
        }

        for (let i = this.stars.stars.length; i--;) {
            const star = this.stars.stars[i];
            this.drawCircle(star.x, star.y, star.radius);
            star.radius += this.stars.radiusIncrement;

            if (star.radius >= 3) this.stars.stars.splice(i, 1);
        }
    }

    /** Renders the actual arena when spawned in. */
    private Arena(delta: number) {
        /** Update FPS. */
        if (this.FPS.fps.length > 10) this.FPS.fps.shift();
        this.FPS.fps.push(1000 / delta);
        this.client.elements.arena.fps.innerText = (this.FPS.fps.reduce((a, b) => a + b) / this.FPS.fps.length).toFixed(1) + '  FPS';
        
        // RENDER OUTBOUNDS:
        this.ctx.fillStyle = "rgba(12, 50, 54, 1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        let pos: { x: number, y: number, ts: number };
        let angle: number;

        const frame = Date.now() - (1000 / 60);
        
        if (frame < this.client.player.position.old.ts) pos = this.client.player.position.old;
        else if (frame > this.client.player.position.new.ts) pos = this.client.player.position.new;
        else {
            pos = {
                x: lerp(this.client.player.position.old.x, this.client.player.position.new.x, 0.5),
                y: lerp(this.client.player.position.old.y, this.client.player.position.new.y, 0.5),
                ts: Date.now()
            }
        };

        if (frame < this.client.player.angle.old.ts) angle = this.client.player.angle.old.measure;
        else if (frame > this.client.player.angle.new.ts) angle = this.client.player.angle.new.measure;
        else {
            angle = lerpAngle(this.client.player.angle.old.measure, this.client.player.angle.new.measure, 0.5);
        }

        let { x: cameraX, y: cameraY } = pos;

        /** Set up player camera. */
        const factor = Math.min(this.canvas.width / 1080, this.canvas.height / 1920);
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // Set <0, 0> to center.
        this.ctx.scale(factor * this.client.player.fov, factor * this.client.player.fov); // Multiply operands by a view scale if needed.
        this.ctx.translate(-cameraX, -cameraY);

        /** Render background of the arena. */

        // RENDER INBOUNDS:
        this.ctx.strokeStyle = "#2F8999";
        this.ctx.lineWidth = 10;        
        this.ctx.fillStyle = "rgb(5,28,31)";

        this.ctx.strokeRect(0, 0, 14400, 14400);
        this.ctx.fillRect(0, 0, 14400, 14400);

        for (const entity of this.client.player.surroundings) entity.render(this.ctx, frame);
        this.client.player.render(this, this.ctx, pos, angle);

        this.ctx.restore();
    }
}