interface CustomAudio extends HTMLAudioElement {
    stopping?: boolean;
}

/** Manages audio functions such as playing, pausing, looping, etc. */
export default class AudioManager {
    /** Path to the audio files. */
    private files = [
        { path: "/audio/ingame.mp3", loop: true, effect: false, playing: false },
        { path: "/audio/button_press.mp3", loop: false, effect: true, playing: false },
        { path: "/audio/bump.mp3", loop: false, effect: true, playing: false },
    ];
    /** Indexes to each audio track. */
    private indexes: string[] = ["game", "button_press", "bump"];

    public tracks: CustomAudio[] = [];

    constructor() {
        for (const { path, loop } of this.files) {
            const track = new Audio(path) as CustomAudio;
            track.loop = loop;
            this.tracks.push(track);
        }

        setInterval(() => this.tick(), 1000 / 60);
    }

    /** Plays the audio track. */
    public play(phase: string) {
        const idx = this.indexes.indexOf(phase);

        if (this.files[idx].playing === true) return;
        console.log(localStorage.getItem("disableSoundTracks"), !this.files[idx].effect);
        if (localStorage.getItem("disableSoundTracks") === "true" && !this.files[idx].effect) return;
        if (localStorage.getItem("disableSoundEffects") === "true" && this.files[idx].effect) return;
        
        this.tracks[idx].play();
        this.files[idx].playing = true;
    }

    /** Stops the audio track. */
    public stop(phase: string) {
        const idx = this.indexes.indexOf(phase);

        this.files[idx].playing = false;
        const track = this.tracks[idx] as CustomAudio;
        track.stopping = true;
    }

    public tick() {
        for (const track of this.tracks) {
            if (track.stopping) {
                track.volume -= 0.01;
                if (track.volume <= 0) {
                    track.pause();
                    track.currentTime = 0;
                    track.volume = 1;
                    track.stopping = false;
                }
            }
        }
    }
}