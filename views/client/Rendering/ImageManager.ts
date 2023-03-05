import { FRAME_COUNT } from "../Utils/Config";

/** Manages frames of an image when rendering so it looks like a GIF. */
export default class ImageManager {
    /** All cached images. */
    public images = new Map<string, {
        at: number,
        frames: HTMLImageElement[],
        delay: number
    }>(); // CharacterName => { frames: Images[], at: number }

    /** The delay before switching to a new frame. */

    /** Requests for the current frame of an image. */
    public get(path: string, sharded = false): HTMLImageElement | void {
        let data = this.images.get(path);
        if (!data) return this.request(path, sharded);

        const image = data.frames[data.at];
        /** @ts-ignore */
        if (data.frames.length && sharded && ++data.delay > 4) {
            data.at = ++data.at % data.frames.length;
            data.delay = 0;
        }

        return image;
    }

    /** Requests for an image to be cached. */
    public request(path: string, sharded = false) {
        this.images.set(path, {
            at: 0,
            frames: [],
            delay: 0
        });

        if (sharded) {
            for (let i = 0; i < FRAME_COUNT; i++) {
                const image = new Image();
                image.src = `${path}${i + 1}.png`;
                image.addEventListener("load", () => {
                    this.images.get(path)!.frames.push(image);
                });
            }
        } else {
            const image = new Image();
            image.src = path + ".png";
            image.addEventListener("load", () => {
                this.images.get(path)!.frames.push(image);
            });
        }
    }
}