import Client from "../Client";
import { Characters, Abilities } from "../Const/Definitions";
import { ServerBound } from "../Const/Enums";

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
    };

    /** The canvas to draw on. */
    /** @ts-ignore */
    public canvas: HTMLCanvasElement = document.getElementById("canvas")!;
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

        /** Create pointers for abilities and characters. */
        console.log(this.homescreen.characterSelector.arrowRight);
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
        });
    }

    private loop() {
        /** Update client's canvas. */
        this.client.canvas?.render();

        /** Check if character has changed. */
        let intuition = false;
        const character = Characters[this.client.player.character]!;
        if (this.homescreen.characterSelector.characterName.innerText !== character.name) {
            intuition = true;
            this.homescreen.characterSelector.characterName.innerText = character.name;
            /** @ts-ignore */
            this.homescreen.characterSelector.characterSprite.src = `assets/img/characters/gifs/${character.src}`;
        }

        const playerAbility = Abilities[this.client.player.ability]!;
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
                    this.client.player.ability = character.abilities[i];
                });
    
                this.homescreen.characterSelector.abilitySelector.appendChild(image);
            });
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}