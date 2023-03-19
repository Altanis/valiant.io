interface CustomAudio extends HTMLAudioElement {
    stopping?: boolean;
}

/** Manages audio functions such as playing, pausing, looping, etc. */
export default class AudioManager {
    /** Path to the audio files. */
    private files = [
        { path: "/audio/ingame.mp3", loop: true }
    ];
    /** Indexes to each audio track. */
    private indexes: string[] = ["game"];

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
        if (localStorage.noMusic) return;
        this.tracks[this.indexes.indexOf(phase)].play();
    }

    /** Stops the audio track. */
    public stop(phase: string) {
        const track = this.tracks[this.indexes.indexOf(phase)] as CustomAudio;
        track.stopping = true;
    }

    public tick() {
        for (const track of this.tracks) {
            if (track.stopping) {
                track.volume -= 0.1;
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