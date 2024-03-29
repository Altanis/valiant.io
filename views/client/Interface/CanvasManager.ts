import Client from "../Client";
import { Entities, Phases, ServerBound } from "../Const/Enums";
import { ARENA_SIZE, GRID_SIZE } from "../Utils/Config";
import { constrain, randomRange, TAU } from "../Utils/Functions";
import ImageManager from "./ImageManager";

/** Psuedorandom number in between two ranges. */

/** The canvas where nearly all visual representation is drawn. */
export default class CanvasManager {
    /** CANVAS */
    /** @ts-ignore */
    public canvas: HTMLCanvasElement = document.getElementById("canvas")!;
    /** The context to draw on. */
    public ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;

    /** MAP CANVAS */
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

    /** If the grid should be drawn. */
    public grid = localStorage.getItem("hideGrid") !== "true";

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
    public roundRect(x: number, y: number, w: number, h: number, r: number, ctx = this.ctx) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        /** @ts-ignore */
        r = r - (r < 0) * r;

        const xr = x + r,
            xw = x + w,
            yh = y + h;
        ctx.beginPath();
        ctx.moveTo(xr, y);
        ctx.arcTo(xw, y, xw, yh, r);
        ctx.arcTo(xw, yh, x, yh, r);
        ctx.arcTo(x, yh, x, y, r);
        ctx.arcTo(x, y, xw, y, r);
        ctx.closePath();
        ctx.fill();
    }

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
        if (this.FPS.fps.length > 30) this.FPS.fps.shift();
        this.FPS.fps.push(delta);

        const deltaAverage = (this.FPS.fps.reduce((a, b) => a + b) / this.FPS.fps.length);
        this.client.elements.arena.fps.innerText = (1000 / deltaAverage).toFixed(1) + '  FPS';

        // RENDER OUTBOUNDS:
        this.ctx.fillStyle = "rgba(12, 50, 54, 1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        const deltaTick = constrain(0, deltaAverage / 16.66, 1);
        const pos = this.client.player.lerpPosition(deltaTick);
        const angle = this.client.player.lerpAngle(deltaTick);

        let { x: cameraX, y: cameraY } = pos;

        /** Set up player camera. */
        const factor = Math.min(this.canvas.width / 1920, this.canvas.height / 1080);
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // Set <0, 0> to center.
        this.ctx.scale(factor * this.client.player.fov, factor * this.client.player.fov);
        this.ctx.translate(-cameraX + this.client.player.position.velocity.current.x, -cameraY + this.client.player.position.velocity.current.y);

        // RENDER INBOUNDS:
        this.ctx.strokeStyle = "#2F8999";
        this.ctx.lineWidth = 10;        
        this.ctx.fillStyle = "rgb(5,28,31)";

        this.ctx.strokeRect(0, 0, ARENA_SIZE, ARENA_SIZE);
        this.ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);

        // RENDER GRID:
        if (this.grid) {
            this.ctx.strokeStyle = "#334f52";
            this.ctx.lineWidth = 1;

            for (let x = 0; x < ARENA_SIZE; x += GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, ARENA_SIZE);
                this.ctx.stroke();
            }

            for (let y = 0; y < ARENA_SIZE; y += GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(ARENA_SIZE, y);
                this.ctx.stroke();
            }
        }
            
        for (const entity of this.client.player.surroundings) {
            switch (entity.type) {
                case Entities.Box: entity.render(this.ctx, deltaTick); break;
                /** @ts-ignore */
                case Entities.Player: entity.renderOther(this, this.ctx, entity.lerpPosition(deltaTick), entity.lerpAngle(deltaTick)); break;
            }
        }

        
        this.client.player.render(this, this.ctx, pos, angle);

        this.ctx.restore();
    }
}
