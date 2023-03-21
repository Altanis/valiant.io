interface CustomAudio extends HTMLAudioElement {
    stopping?: boolean;
}

/** Manages audio functions such as playing, pausing, looping, etc. */
export default class AudioManager {
    /** Path to the audio files. */
    private files = [
        { path: "/audio/ingame.mp3", loop: true, effect: false },
        { path: "/audio/button_press.mp3", loop: false, effect: true }
    ];
    /** Indexes to each audio track. */
    private indexes: string[] = ["game", "button_press"];

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

        if (localStorage.getItem("disableSoundTracks") && !this.files[idx].effect) return;
        if (localStorage.getItem("disableSoundEffects") && this.files[idx].effect) return;
        
        this.tracks[idx].play();
    }

    /** Stops the audio track. */
    public stop(phase: string) {
        const track = this.tracks[this.indexes.indexOf(phase)] as CustomAudio;
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