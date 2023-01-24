/** Manages frames of an image when rendering so it looks like a GIF. */
export default class ImageManager {
    /** All cached images. */
    public images = new Map<string, {
        frames: HTMLImageElement[],
        at: number
    }>(); // CharacterName => { frames: Images[], at: number }

    /** The delay before switching to a new frame. */
    /** @ts-ignore */
    private delay = 0;

    /** Requests for the current frame of an image. */
    public get(name: string): HTMLImageElement | void {
        let data = this.images.get(name);
        if (!data) return this.request(name);

        const image = data.frames[data.at];
        /** @ts-ignore */
        if (data.frames.length && ++this.delay > 2) {
            data.at = ++data.at % data.frames.length;
            this.delay = 0;
        }

        return image;
    }

    /** Requests for an image to be cached. */
    public request(name: string) {
        this.images.set(name, {
            at: 0,
            frames: []
        });

        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `img/characters/frames/${name}/${name}${i + 1}.png`;
            image.addEventListener("load", () => {
                this.images.get(name)!.frames.push(image);
            });
        }
    }
}