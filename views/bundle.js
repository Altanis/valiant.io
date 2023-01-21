/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 48:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Connection_1 = __importDefault(__webpack_require__(680));
const Logger_1 = __importDefault(__webpack_require__(916));
const ElementManager_1 = __importDefault(__webpack_require__(566));
const CanvasManager_1 = __importDefault(__webpack_require__(580));
const Player_1 = __importDefault(__webpack_require__(141));
/** A representation of the client currently on the site. */
class Client {
    constructor() {
        /** The logging system in the IOStream. */
        this.logger = Logger_1.default;
        /** The player information of the client. */
        this.player = new Player_1.default();
        /** The connection between the client and the server. */
        this.connection = new Connection_1.default(this, "ws://localhost:8080");
        /** The DOM element manager. */
        this.elements = new ElementManager_1.default(this);
        /** The canvas on which the client draws on. */
        this.canvas = new CanvasManager_1.default();
    }
}
exports["default"] = Client;
;


/***/ }),

/***/ 680:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const SwiftStream_1 = __importDefault(__webpack_require__(210));
const Enums_1 = __webpack_require__(109);
const MessageHandler_1 = __importDefault(__webpack_require__(671));
/** A representation of the WebSocket connection between the client and the server. */
class Connection extends EventTarget {
    constructor(client, url) {
        super();
        /** The amount of retries attempted. */
        this.retries = 0;
        /** The binary encoder/decoder for the connection. */
        this.SwiftStream = new SwiftStream_1.default();
        /** The handler for incoming messages. */
        this.MessageHandler = new MessageHandler_1.default(this);
        this.client = client;
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";
        this.handle();
    }
    migrate(url) {
        if (++this.retries > 3)
            return this.client.logger.err("[WS]: Threshold for retries has been exceeded. Please reload.");
        this.socket.close(4999);
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";
        this.handle();
    }
    send(header, data) {
        this.SwiftStream.WriteI8(header);
        switch (header) {
            case Enums_1.ServerBound.Spawn: {
                this.socket.send(this.SwiftStream
                    .WriteCString(data.name)
                    .WriteI8(this.client.player.character)
                    .WriteI8(this.client.player.ability)
                    .Write());
                console.log("we all want llv");
                break;
            }
            case Enums_1.ServerBound.Movement: {
                this.socket.send(this.SwiftStream.WriteI8(data.movement).Write());
                break;
            }
            case Enums_1.ServerBound.Angle: {
                this.socket.send(this.SwiftStream.WriteI8(this.client.player.angle).Write());
                break;
            }
            case Enums_1.ServerBound.Attack: {
                this.socket.send(this.SwiftStream.WriteI8(data.isAtk).Write());
                break;
            }
            default: {
                this.SwiftStream.Write();
                throw new Error("Could not find header.");
            }
        }
    }
    handle() {
        this.socket.addEventListener("open", () => {
            this.client.logger.success("[WS]: Connected to server.");
        });
        this.socket.addEventListener("error", () => {
            this.client.logger.err("[WS]: Connection to server has failed.");
            this.migrate(this.socket.url);
        });
        this.socket.addEventListener("close", event => {
            if (event.code === 4999)
                return; // Internal migration code.
            console.log(Enums_1.CloseEvents[event.code] || Enums_1.CloseEvents.Unknown);
        });
        this.socket.addEventListener("message", ({ data }) => {
            this.SwiftStream.Set(data = new Uint8Array(data));
            this.parse();
        });
    }
    parse() {
        const SwiftStream = this.SwiftStream;
        const header = SwiftStream.ReadI8();
        switch (header) {
            case Enums_1.ClientBound.Update: return this.MessageHandler.Update();
        }
        this.SwiftStream.Clear();
    }
}
exports["default"] = Connection;


/***/ }),

/***/ 671:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Enums_1 = __webpack_require__(109);
/** A handler for all incoming messages. */
class MessageHandler {
    constructor(connection) {
        this.connection = connection;
    }
    // Woah, that's a big packet!
    Update() {
        const SwiftStream = this.connection.SwiftStream;
        const type = SwiftStream.ReadI8();
        if (type === 0x00) { // update player
            let len = SwiftStream.ReadI8();
            for (; len--;) {
                const field = SwiftStream.ReadI8();
                switch (field) {
                    case Enums_1.Fields.ID: {
                        const id = SwiftStream.ReadI8();
                        this.connection.client.player.id = id;
                        this.connection.client.elements.homescreen.homescreen.style.display = "none";
                        this.connection.client.canvas.phase = Enums_1.Phases.Arena;
                        break;
                    }
                    case Enums_1.Fields.Position: {
                        const x = SwiftStream.ReadFloat32();
                        const y = SwiftStream.ReadFloat32();
                        this.connection.client.player.position.old = this.connection.client.player.position.new;
                        this.connection.client.player.position.new = { x, y };
                        break;
                    }
                    case Enums_1.Fields.Attacking:
                        { }
                        break;
                    case Enums_1.Fields.Weapons: {
                        const weapon = SwiftStream.ReadI8();
                        this.connection.client.player.weapon = weapon;
                    }
                }
            }
        }
        const surroundings = type === 0x00 ? SwiftStream.ReadI8() : type;
        if (surroundings === 0x01) {
            let len = SwiftStream.ReadI8();
            for (; len--;) {
                const entity = SwiftStream.ReadI8();
                switch (entity) {
                    case Enums_1.Entities.Box: {
                        const x = SwiftStream.ReadFloat32();
                        const y = SwiftStream.ReadFloat32();
                        console.log("Found a box at", x, y);
                        break;
                    }
                }
            }
        }
    }
}
exports["default"] = MessageHandler;


/***/ }),

/***/ 210:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** BUFFERS: Used to convert between different byte lengths. */
const conversion = new ArrayBuffer(4);
const u8 = new Uint8Array(conversion);
const f32 = new Float32Array(conversion);
/** SwiftStream, an efficient binary protocol manager written by Altanis. */
class SwiftStream {
    constructor() {
        /** The buffer SwiftStream is using. */
        this.buffer = new Uint8Array(4096);
        /** The position at which the buffer is being read. */
        this.at = 0;
        /** UTF8 Decoder. */
        this.TextDecoder = new TextDecoder();
        /** UTF8 Encoder. */
        this.TextEncoder = new TextEncoder();
    }
    Set(buffer) {
        this.buffer = buffer;
        this.at = 0;
    }
    Clear() {
        this.buffer = new Uint8Array(4096);
        this.at = 0;
    }
    /** READER */
    ReadI8() {
        return this.buffer[this.at++];
    }
    ReadFloat32() {
        u8.set(this.buffer.slice(this.at, this.at += 4));
        return f32[0];
    }
    ReadUTF8String() {
        const start = this.at;
        while (this.buffer[this.at++])
            ;
        return this.TextDecoder.decode(this.buffer.slice(start, this.at - 1));
    }
    /** WRITER */
    WriteI8(value) {
        this.buffer[this.at++] = value;
        return this;
    }
    WriteFloat32(value) {
        f32[0] = value;
        this.buffer.set(u8, this.at);
        this.at += 4;
        return this;
    }
    WriteCString(value) {
        this.buffer.set(this.TextEncoder.encode(value), this.at);
        this.at += value.length;
        this.buffer[this.at++] = 0;
        return this;
    }
    Write() {
        const result = this.buffer.subarray(0, this.at);
        this.Clear();
        return result;
    }
}
exports["default"] = SwiftStream;


/***/ }),

/***/ 668:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Weapons = exports.Abilities = exports.Characters = void 0;
/** Characters and all their necessary clientside data. */
const Characters = [
    /** Knight */
    {
        name: "Knight",
        stats: {
            health: 7,
            armor: 6,
            energy: 250
        },
        abilities: [0, 1],
        src: "Knight.gif"
    },
    {
        name: "Priest",
        stats: {},
        abilities: [1],
        src: "Priest.gif"
    }
];
exports.Characters = Characters;
/** Abilities, a specific property of characters. */
const Abilities = [
    /** Dual Wield */
    {
        name: "Dual Wield",
        description: "Attack with double the power.",
        src: "dual_wield.png",
    },
    /** Charge */
    {
        name: "Charge",
        description: "Bash into a foe with your shield.",
        src: "charge.png",
    }
];
exports.Abilities = Abilities;
/** Weapons, objects used to attack. */
const Weapons = [
    /** Rusty Blade */
    {
        name: "Rusty Blade",
        type: "melee",
        rarity: "common",
        damage: 10,
        range: Math.PI / 4,
        speed: 30,
        src: "rusty_blade.png",
    }
];
exports.Weapons = Weapons;


/***/ }),

/***/ 109:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Movement = exports.Entities = exports.Fields = exports.ServerBound = exports.ClientBound = exports.Phases = exports.CloseEvents = void 0;
/** Representation of possible reasons the connection was closed. */
var CloseEvents;
(function (CloseEvents) {
    CloseEvents[CloseEvents["TooManyConnections"] = 3000] = "TooManyConnections";
    CloseEvents[CloseEvents["ServerFilled"] = 3001] = "ServerFilled";
    CloseEvents[CloseEvents["InvalidProtocol"] = 3002] = "InvalidProtocol";
    CloseEvents[CloseEvents["Banned"] = 3003] = "Banned";
    CloseEvents[CloseEvents["Unknown"] = 3006] = "Unknown";
})(CloseEvents = exports.CloseEvents || (exports.CloseEvents = {}));
;
/** Representation of the phase canvas is rendering. */
var Phases;
(function (Phases) {
    Phases[Phases["Homescreen"] = 0] = "Homescreen";
    Phases[Phases["Arena"] = 1] = "Arena";
})(Phases = exports.Phases || (exports.Phases = {}));
;
var ClientBound;
(function (ClientBound) {
    /** Tells the client of it's surroundings. */
    ClientBound[ClientBound["Update"] = 0] = "Update";
})(ClientBound = exports.ClientBound || (exports.ClientBound = {}));
;
var ServerBound;
(function (ServerBound) {
    /** Client tells the server they want to spawn. [string(name), i8(characterIdx), i8(abilityIdx)] */
    ServerBound[ServerBound["Spawn"] = 0] = "Spawn";
    /** Client tells the server they want to move. [i8(Movement)] */
    ServerBound[ServerBound["Movement"] = 1] = "Movement";
    /** The angle the player is facing, in radians. [f32(angle)] */
    ServerBound[ServerBound["Angle"] = 2] = "Angle";
    /** Client tells the server they want to attack. */
    ServerBound[ServerBound["Attack"] = 3] = "Attack";
    /** Client cheats (when given developer code). */
    ServerBound[ServerBound["Cheats"] = 255] = "Cheats";
})(ServerBound = exports.ServerBound || (exports.ServerBound = {}));
;
/** Fields of the Update packet. */
var Fields;
(function (Fields) {
    /** The ID of the entity. */
    Fields[Fields["ID"] = 0] = "ID";
    /** The position of the entity. */
    Fields[Fields["Position"] = 1] = "Position";
    /** If the entity is attacking. */
    Fields[Fields["Attacking"] = 2] = "Attacking";
    /** The weapon(s) of the player. */
    Fields[Fields["Weapons"] = 3] = "Weapons";
})(Fields = exports.Fields || (exports.Fields = {}));
;
/** Object types. */
var Entities;
(function (Entities) {
    Entities[Entities["Player"] = 0] = "Player";
    Entities[Entities["Box"] = 1] = "Box";
})(Entities = exports.Entities || (exports.Entities = {}));
/** Movement codes. */
var Movement;
(function (Movement) {
    Movement[Movement["Up"] = 1] = "Up";
    Movement[Movement["Right"] = 2] = "Right";
    Movement[Movement["Down"] = 3] = "Down";
    Movement[Movement["Left"] = 4] = "Left";
})(Movement = exports.Movement || (exports.Movement = {}));
;


/***/ }),

/***/ 141:
/***/ ((__unused_webpack_module, exports) => {


// import Vector from "../Utils/Vector";
Object.defineProperty(exports, "__esModule", ({ value: true }));
/** A representation of a Player entity. */
class Player {
    constructor() {
        /** The character index of the player. */
        this.character = 0;
        /** The ability index of the player. */
        this.ability = 0;
        /** The weapon the player is holding. */
        this.weapon = 0;
        /** The ID of the player. */
        this.id = 0;
        /** The position of the player. */
        this.position = {
            /** Position from one frame ago. */
            old: { x: 0, y: 0 },
            /** Position at current frame. */
            new: { x: 0, y: 0 }
        };
        /** The angle of the player. */
        this.angle = 0;
        /** Renders the player on the canvas. */
    }
}
exports["default"] = Player;


/***/ }),

/***/ 678:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Client_1 = __importDefault(__webpack_require__(48));
const client = new Client_1.default();


/***/ }),

/***/ 580:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Enums_1 = __webpack_require__(109);
/** Constant for 360 degrees in radians. */
const TAU = Math.PI * 2;
/** Psuedorandom number in between two ranges. */
const randomRange = (min, max) => Math.random() * (max - min) + min;
/** The canvas where nearly all visual representation is drawn. */
class CanvasManager {
    constructor() {
        /** The canvas element. */
        /** @ts-ignore */
        this.canvas = document.getElementById("canvas");
        /** The context to draw on. */
        this.ctx = this.canvas.getContext("2d");
        /** The phase in which rendering is occuring. */
        this.phase = Enums_1.Phases.Homescreen;
        /** The difference in between two frame renders. */
        this.delta = 0;
        /** The stars on the homescreen. */
        this.stars = {
            count: 200,
            stars: [],
            radiusIncrement: 0.1
        };
    }
    render() {
        console.log(this.phase);
        this.delta = Date.now() - this.delta;
        switch (this.phase) {
            case Enums_1.Phases.Homescreen:
                this.Homescreen();
                break;
            case Enums_1.Phases.Arena:
                this.Arena(this.delta);
                break;
        }
    }
    /** UTILITIES */
    drawCircle(x, y, r, ctx = this.ctx) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
    }
    /** Renders the homescreen background (with pulsating stars). */
    Homescreen() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#FFFFFF";
        for (let i = this.stars.count - this.stars.stars.length; --i;) {
            this.stars.stars.push({
                x: randomRange(0, this.canvas.width),
                y: randomRange(0, this.canvas.width),
                radius: randomRange(0.1, 1.5),
            });
        }
        for (let i = this.stars.stars.length; i--;) {
            const star = this.stars.stars[i];
            this.drawCircle(star.x, star.y, star.radius);
            star.radius += this.stars.radiusIncrement;
            if (star.radius >= 3)
                this.stars.stars.splice(i, 1);
        }
    }
    /** Renders the actual arena when spawned in. */
    Arena(delta) {
        console.log(delta);
    }
}
exports["default"] = CanvasManager;


/***/ }),

/***/ 566:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Definitions_1 = __webpack_require__(668);
const Enums_1 = __webpack_require__(109);
/** Manages DOM elements. */
class ElementManager {
    constructor(client) {
        /** Interactive elements on the homescreen. */
        this.homescreen = {
            /** The div which contains all elements of the homescreen. */
            homescreen: document.getElementById("homescreen"),
            /** The button which spawns the player. */
            play: document.getElementById("play"),
            /** The input where the name is held. */
            // none yet
            /** The div which holds all 3 gamemode buttons. */
            gamemodes: document.getElementById("gamemodes"),
            /** The button to trigger the settings modal. */
            settings: document.getElementById("settings"),
            /** The screen which displays when the client has disconnected. */
            disconnect: document.getElementById("disconnect"),
            /** The div with the character selector. */
            characterSelector: {
                /** The left arrow for the character. */
                arrowLeft: document.getElementById("arrow-left"),
                /** The right arrow for the character. */
                arrowRight: document.getElementById("arrow-right"),
                /** The name of the character. */
                characterName: document.getElementById("character-name"),
                /** The sprite of the character. */
                characterSprite: document.getElementById("character-sprite"),
                /** The name of the ability. */
                abilityName: document.getElementById("ability-name"),
                /** The description of the ability. */
                abilityDesc: document.getElementById("ability-desc"),
                /** The selector icons of the abilities. */
                abilitySelector: document.getElementById("ability")
            }
        };
        /** Toggleable settings. */
        this.settings = {
            /** The div which contains toggleable settings. */
            settings: document.getElementById("settingsModal"),
        };
        /** Elements which display while playing. */
        this.arena = {
            /** The div which contains every stat of the player. */
            stats: document.getElementById("stats"),
            /** The health bar in the stats div. */
            health: document.getElementById("health"),
            /** The armor bar in the stats div. */
            armor: document.getElementById("armor"),
            /** The energy bar in the stats div. */
            energy: document.getElementById("energy"),
        };
        /** The canvas to draw on. */
        /** @ts-ignore */
        this.canvas = document.getElementById("canvas");
        /** Pre-setup: add stat texts. */
        document.querySelectorAll(".progress-bar").forEach((p, i) => {
            let name = "";
            switch (i) {
                case 0:
                    name = "health";
                    break;
                case 1:
                    name = "armor";
                    break;
                case 2:
                    name = "energy";
                    break;
            }
            name += "Text";
            /** @ts-ignore */
            this.arena[name] = p;
        });
        this.client = client;
        this.setup();
        this.loop();
    }
    setup() {
        /** Add resize handlers for the canvas. */
        window.addEventListener("resize", () => {
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
        });
        window.dispatchEvent(new Event("resize"));
        /** Create pointers for abilities and characters. */
        console.log(this.homescreen.characterSelector.arrowRight);
        this.homescreen.characterSelector.arrowLeft.addEventListener("click", () => {
            this.client.player.character = (this.client.player.character - 1 + Definitions_1.Characters.length) % Definitions_1.Characters.length;
            this.client.player.ability = Definitions_1.Characters[this.client.player.character].abilities[0];
        });
        this.homescreen.characterSelector.arrowRight.addEventListener("click", () => {
            this.client.player.character = (this.client.player.character + 1) % Definitions_1.Characters.length;
            this.client.player.ability = Definitions_1.Characters[this.client.player.character].abilities[0];
        });
        /** Send play signal to server when Play is pressed. */
        this.homescreen.play.addEventListener("click", () => {
            this.client.connection.send(Enums_1.ServerBound.Spawn, {
                name: "Altanis"
            });
        });
    }
    loop() {
        var _a;
        /** Update client's canvas. */
        (_a = this.client.canvas) === null || _a === void 0 ? void 0 : _a.render();
        /** Check if character has changed. */
        let intuition = false;
        const character = Definitions_1.Characters[this.client.player.character];
        if (this.homescreen.characterSelector.characterName.innerText !== character.name) {
            intuition = true;
            this.homescreen.characterSelector.characterName.innerText = character.name;
            /** @ts-ignore */
            this.homescreen.characterSelector.characterSprite.src = `assets/img/characters/gifs/${character.src}`;
        }
        const playerAbility = Definitions_1.Abilities[this.client.player.ability];
        if (this.homescreen.characterSelector.abilityName.innerHTML !== playerAbility.name || intuition) {
            this.homescreen.characterSelector.abilityName.innerHTML = playerAbility.name;
            this.homescreen.characterSelector.abilitySelector.innerHTML = "";
            character.abilities.map(ability => Definitions_1.Abilities[ability]).forEach((ability, i) => {
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
exports["default"] = ElementManager;


/***/ }),

/***/ 916:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** A colorful logger to highlight important actions. */
const Logger = {
    log: (...args) => console.log(`%c[${new Date().toLocaleDateString()}]: ${args.join(" ")}`, 'color: blue;'),
    err: (...args) => console.log(`%c[${new Date().toLocaleDateString()}]: ${args.join(" ")}`, 'color: red;'),
    success: (...args) => console.log(`%c[${new Date().toLocaleDateString()}]: ${args.join(" ")}`, 'color: green;'),
    warn: (...args) => console.log(`%c[${new Date().toLocaleDateString()}]: ${args.join(" ")}`, 'color: yellow;'),
    debug: (...args) => console.log(args.join(" "))
};
exports["default"] = Logger;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(678);
/******/ 	
/******/ })()
;