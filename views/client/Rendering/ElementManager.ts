/** Manages DOM elements. */
export default class ElementManager {
    /** Interactive elements on the homescreen. */
    public homescreen: {
        [key: string]: HTMLElement | { [key: string]: HTMLElement }
    } = {};
    /** Toggleable settings. */
    public settings: {
        [key: string]: HTMLElement | { [key: string]: HTMLElement }
    } = {};
    
    constructor() {
        this.homescreen = {
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
                arrowRight: document.getElementById("arrow-left")!,
                
                /** The name of the ability. */
                abilityName: document.getElementById("ability-name")!,
                /** The description of the ability. */
                abilityDesc: document.getElementById("ability-desc")!,
                /** The selector icons of the abilities. */
                abilitySelector: document.getElementById("ability-name")!
            }
        };

        this.settings = {
            /** The div which contains toggleable settings. */
            settings: document.getElementById("settingsModal")!,
        };
    }
}