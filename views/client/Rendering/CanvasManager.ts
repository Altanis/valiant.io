import { Phases } from "../Const/Enums";

/** Constant for 360 degrees in radians. */
const TAU = Math.PI * 2;
/** Psuedorandom number in between two ranges. */
const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;

/** The canvas where nearly all visual representation is drawn. */
export default class CanvasManager {
    /** The canvas element. */
    /** @ts-ignore */
    public canvas: HTMLCanvasElement = document.getElementById("canvas")!;
    /** The context to draw on. */
    public ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
    /** The phase in which rendering is occuring. */
    public phase = Phases.Homescreen; 
    /** The difference in between two frame renders. */
    private delta = 0;

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
        count: 100,
        stars: [],
        radiusIncrement: 0.1
    }

    constructor() {
        this.startAnimation();
    }

    private startAnimation() {
        this.delta = Date.now() - this.delta;

        switch (this.phase) {
            case Phases.Homescreen: this.Homescreen(); break;
            case Phases.Arena: this.Arena(this.delta); break;
        }

        requestAnimationFrame(this.startAnimation.bind(this));
    }

    /** UTILITIES */
    private drawCircle(x: number, y: number, r: number, ctx = this.ctx) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
    }

    /** Renders the homescreen background (with pulsating stars). */
    private Homescreen() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#FFFFFF";
        if (this.stars.stars.length !== this.stars.count) {
            for (let i = this.stars.count - this.stars.stars.length; --i;) {
                this.stars.stars.push({
                    x: randomRange(0, this.canvas.width),
                    y: randomRange(0, this.canvas.width),
                    radius: randomRange(0, this.canvas.width),
                });
            }

            for (let i = this.stars.stars.length; i--;) {
                const star = this.stars.stars[i];
                this.drawCircle(star.x, star.y, star.radius);
                
                if (star.radius >= 3) {
                    this.stars.stars.splice(i, 1);
                }
            }
        }
    }

    /** Renders the actual arena when spawned in. */
    private Arena(delta: number) {}
}