import { CPlayer } from "../soundbox/player";
import { SoundSettings } from "./soundsettings";

export class Sound {

    private audio: HTMLAudioElement;
    private isMusic: boolean;
    private soundSettings: SoundSettings;

    public constructor(sound: any, soundSettings: SoundSettings, loop = false, isMusic = false) {
        const player = new CPlayer(sound);
        // Generate music...
        let done = false;
        while (!done) {
            done = player.generate() >= 1;
        }
        const t1 = new Date();

        // Put the generated song in an Audio element.
        const wave = player.createWave();
        const audio = document.createElement("audio");
        if (loop) {
            audio.setAttribute("loop", "loop");
        }
        audio.src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
        this.audio = audio;
        this.isMusic = isMusic;
        this.soundSettings = soundSettings;
        this.updateVolume();
    }

    public play() {
        this.updateVolume();
        if (this.audio.paused) {
            const audioPromise = this.audio.play();
            if (audioPromise !== undefined) {
                audioPromise.then((_) => {
                    // Autoplay started!
                }).catch((error) => {
                    // Autoplay was prevented.
                    // Show a "Play" button so that user can start playback.
                    // console.log(error.message);
                });
            }
        } else {
            this.audio.currentTime = 0;
        }
    }

    public pause() {
        this.audio.pause();
    }

    public isPaused() {
        return this.audio.paused;
    }

    private updateVolume() {
        if (this.isMusic) {
            this.audio.volume = this.soundSettings.musicVolume;
        } else {
            this.audio.volume = this.soundSettings.fxVolume;
        }
    }
}
