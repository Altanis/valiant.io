import Client from "../Client";
import { Characters, Abilities, Weapons } from "../Const/Definitions";
import { ServerBound } from "../Const/Enums";
import { TAU, lerpAngle } from "../Utils/Functions";

/** Manages DOM elements. */
export default class ElementManager {
    /** Interactive elements on the homescreen. */
    public homescreen = {
        /** The div which contains all elements of the homescreen. */
        homescreen: document.getElementById("homescreen")!,
        /** The button which spawns the player. */
        play: document.getElementById("play")!,
        /** The input where the name is held. */
        // none yet
        /** The div which holds all 3 gamemode buttons. */
        gamemodes: document.getElementById("gamemodes")!,
        /** The button to trigger the settings modal. */
        settings: document.getElementById("settings")!,
        /** The screen which displays when the client has disconnected. */
        disconnect: document.getElementById("disconnect")!,

        /** The div with the character selector. */
        characterSelector: {
            /** The left arrow for the character. */
            arrowLeft: document.getElementById("arrow-left")!,
            /** The right arrow for the character. */
            arrowRight: document.getElementById("arrow-right")!,

            /** The name of the character. */
            characterName: document.getElementById("character-name")!,
            /** The sprite of the character. */
            characterSprite: document.getElementById("character-sprite")!,
            
            /** The name of the ability. */
            abilityName: document.getElementById("ability-name")!,
            /** The description of the ability. */
            abilityDesc: document.getElementById("ability-desc")!,
            /** The selector icons of the abilities. */
            abilitySelector: document.getElementById("ability")!
        }
    };

    /** Toggleable settings. */
    public settings = {
        /** The div which contains toggleable settings. */
        settings: document.getElementById("settingsModal")!,

        /** The setting to disable grid. */
        hideGrid: document.getElementById("hideGrid")!,

        /** The setting to disable soundtracks. */
        disableSoundTrack: document.getElementById("disableSoundTrack")!,
        /** The setting to disable sound effects. */
        disableSoundEffects: document.getElementById("disableSoundEffects")!,

        /** Back button */
        back: document.getElementById("back")!
    };

    /** Elements which display while playing. */
    public arena: {
        [key: string]: HTMLElement;
    } = {
        /** The div containing all of these elements. */
        game: document.getElementById("game")!,

        /** The div which contains every stat of the player. */
        stats: document.getElementById("stats")!,

        /** The health bar in the stats div. */
        health: document.getElementById("health")!,
        /** The armor bar in the stats div. */
        armor: document.getElementById("armor")!,
        /** The energy bar in the stats div. */
        energy: document.getElementById("energy")!,

        /** The utils of the player, such as FPS/MS/Minimap. */
        utils: document.getElementById("utils")!,

        /** The name of the game. */
        gameName: document.getElementById("gameName")!,
        /** The FPS of the client. */
        fps: document.getElementById("fps")!,
        /** The ping of the client. */
        ping: document.getElementById("ping")!,
        
        /** The death screen when the player dies. */
        death: document.getElementById("death")!,
        
        /** The person who killed the player. */
        killedBy: document.getElementById("killedBy")!,
        /** The time alive. */
        timeAlive: document.getElementById("timeAlive")!,
        /** The button to respawn. */
        respawn: document.getElementById("respawn")!
    };

    /** Elements which play when the player disconnects from the game. */
    public disconnect = {
        /** The div which contains the disconnect message. */
        disconnect: document.getElementById("disconnect")!,

        /** The message displayed when disconnecting. */
        disconnectMessage: document.getElementById("disconnect-message")!
    };

    /** The canvas to draw on. */
    /** @ts-ignore */
    public canvas: HTMLCanvasElement = document.getElementById("canvas")!;

    /** The keys currently being pressed. */
    public activeKeys = new Set<number>();
    /** The mouse coordinates of the client. */
    public mouse = { x: 0, y: 0 };

    /** The client this class is managing. */
    public client: Client;

    constructor(client: Client) {
        this.client = client;

        this.setup();
        this.loop();
    }

    public setup() {
        /** Add resize handlers for the canvas. */
        window.addEventListener("resize", () => {
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
        });
        window.dispatchEvent(new Event("resize"));

        /** Sound effects for button presses. */
        document.querySelectorAll("button").forEach(b => b.addEventListener("click", () => this.client.audio.play("button_press")));

        /** Add stat texts. */
        document.querySelectorAll(".progress-bar")!.forEach((p, i) => {
            let name = "";
            switch (i) {
                case 0: name = "health"; break;
                case 1: name = "armor"; break;
                case 2: name = "energy"; break;
            }

            name += "Text";

            /** @ts-ignore */
            this.arena[name] = p.children[1];
        });
        
        /** Create pointers for abilities and characters. */
        this.homescreen.characterSelector.arrowLeft.addEventListener("click", () => {
            this.client.player.character = (this.client.player.character - 1 + Characters.length) % Characters.length;
            this.client.player.ability = Characters[this.client.player.character]!.abilities[0];
        });

        this.homescreen.characterSelector.arrowRight.addEventListener("click", () => {
            this.client.player.character = (this.client.player.character + 1) % Characters.length;
            this.client.player.ability = Characters[this.client.player.character]!.abilities[0];
        });

        /** Send play signal to server when Play is pressed. */
        this.homescreen.play.addEventListener("click", () => {
            this.client.connection.send(ServerBound.Spawn, {
                name: "Altanis"
            });

            const { health, armor, energy } = Characters[this.client.player.character].stats;
            
            /** @ts-ignore */
            this.arena.healthText.innerText = `${health}/${health}`;
            /** @ts-ignore */
            this.arena.armorText.innerText = `${armor}/${armor}`;
            /** @ts-ignore */
            this.arena.energyText.innerText = `${energy}/${energy}`;
        });

        /** Send play signal to server when Respawn is pressed.  */
        this.arena.respawn.addEventListener("click", () => {
            this.client.connection.send(ServerBound.Spawn, {
                name: "Altanis"
            });
        });

        /** Take settings into account. */
        /** @ts-ignore */
        setTimeout(() => (this.settings.hideGrid.checked = localStorage.getItem("hideGrid") === "true"), 1000);
        /** @ts-ignore */
        setTimeout(() => (this.settings.disableSoundTrack.checked = localStorage.getItem("disableSoundTracks") === "true"), 1000);
        /** @ts-ignore */
        setTimeout(() => (this.settings.disableSoundEffects.checked = localStorage.getItem("disableSoundEffects") === "true"), 1000);

        this.settings.hideGrid.addEventListener("change", () => {
            /** @ts-ignore */
            localStorage.setItem("hideGrid", this.settings.hideGrid.checked);
            /** @ts-ignore */
            this.client.canvas.grid = !this.settings.hideGrid.checked;
        });

        this.settings.disableSoundTrack.addEventListener("change", () => {
            /** @ts-ignore */
            localStorage.setItem("disableSoundTracks", this.settings.disableSoundTrack.checked);
        });

        this.settings.disableSoundEffects.addEventListener("change", () => {
            /** @ts-ignore */
            localStorage.setItem("disableSoundEffects", this.settings.disableSoundEffects.checked);
        });

        this.homescreen.settings.addEventListener("click", () => {
            this.settings.settings.style.display = "flex";
            this.homescreen.homescreen.style.display = "none";
        });

        this.settings.back.addEventListener("click", () => {
            this.settings.settings.style.display = "none";
            this.homescreen.homescreen.style.display = "block";
        });
    }

    public update(stat: "health" | "armor" | "energy", target: number) {
        const max = Characters[this.client.player.character].stats[stat];
        
        this.arena[stat + "Text"].innerText = `${target}/${max}`;
        this.arena[stat].style.width = `${target / max * 100}%`;
        this.client.player[stat] = target;
    }   

    private loop() {
        const player = this.client.player;

        /** Update client's canvas. */
        this.client.canvas?.render();

        /** Check if character has changed. */
        let intuition = false;
        const character = Characters[player.character]!;
        if (this.homescreen.characterSelector.characterName.innerText !== character.name) {
            intuition = true;
            this.homescreen.characterSelector.characterName.innerText = character.name;
            /** @ts-ignore */
            this.homescreen.characterSelector.characterSprite.src = `assets/img/characters/gifs/${character.src}`;
        }

        const playerAbility = Abilities[player.ability]!;
        if (this.homescreen.characterSelector.abilityName.innerHTML !== playerAbility.name || intuition) {
            this.homescreen.characterSelector.abilityName.innerHTML = playerAbility.name;

            this.homescreen.characterSelector.abilitySelector.innerHTML = "";
            character.abilities.map(ability => Abilities[ability]!).forEach((ability, i) => {
                const image = new Image(50, 50);
                image.src = `assets/img/abilities/${ability.src}`; 
                image.classList.add("character-ability");
                if (ability.name === playerAbility.name) {
                    this.homescreen.characterSelector.abilityDesc.innerText = ability.description;
                    image.classList.add("selected");
                }
    
                image.addEventListener("click", () => {
                    player.ability = character.abilities[i];
                });
    
                this.homescreen.characterSelector.abilitySelector.appendChild(image);
            });
        }

        /** Recognize keypresses. */
        if (this.activeKeys.size) {
            this.client.connection.send(ServerBound.Movement, {
                keys: this.activeKeys
            });
        }

        /** Recognize mouse movements. */
        if (this.mouse && player.alive && !player.attack.attacking.server) {
            const old = player.angle.current;
            const measure = Math.atan2(this.mouse.y - (this.canvas.height / 2), this.mouse.x - (this.canvas.width / 2));
            if (old !== measure) {
                this.client.connection.send(ServerBound.Angle, {
                    measure
                });

                /*player.angle.current = player.angle.target;
                player.angle.target = measure;*/
            }
        }

        /** Update angle when attacking. */
        if (player.attack.attacking.server) {
            player.angle.current = player.angle.target;
            player.attack.mouse = Math.atan2(this.mouse.y - (this.canvas.height / 2), this.mouse.x - (this.canvas.width / 2));
        
            const weapon = Weapons[player.weapon];
            let posRange = player.attack.mouse + weapon.rotation;
            let negRange = player.attack.mouse - weapon.rotation;

            if (posRange > Math.PI) posRange -= TAU;
            if (negRange < -Math.PI) negRange += TAU;

            // TODO(Altanis): Fix lerpAngle fucktion.
            const angle = lerpAngle(posRange, negRange, player.attack.lerpFactor);
            player.attack.lerpFactor += 5 * (weapon.speed / 1000) * player.attack.direction;

            if (player.attack.lerpFactor >= 1 || player.attack.lerpFactor <= 0) {
                player.attack.direction *= -1;
                if (++player.attack.cycles % 2 === 0) {
                    player.attack.attacking.server = player.attack.attacking.change;
                }
            }

            player.angle.target = angle;
        }

        /** Check for when to send an ATTACK packet. */
        if (player.attack.attacking.client !== player.attack.attacking.server) {
            this.client.connection.send(ServerBound.Attack, {
                isAtk: player.attack.attacking.client
            });
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}
