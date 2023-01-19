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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Enums_1 = __webpack_require__(109);
/** A representation of the WebSocket connection between the client and the server. */
class Connection extends EventTarget {
    constructor(client, url) {
        super();
        /** The amount of retries attempted. */
        this.retries = 0;
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
        // handle messages later
    }
}
exports["default"] = Connection;


/***/ }),

/***/ 109:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Phases = exports.CloseEvents = void 0;
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


/***/ }),

/***/ 141:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** A representation of a Player entity. */
class Player {
    constructor() {
        /** The character index of the player. */
        this.character = 0;
        /** The ability index of the player. */
        this.ability = 0;
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
            if (star.radius >= 3) {
                this.stars.stars.splice(i, 1);
            }
        }
    }
    /** Renders the actual arena when spawned in. */
    Arena(delta) { }
}
exports["default"] = CanvasManager;


/***/ }),

/***/ 566:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** Manages DOM elements. */
class ElementManager {
    constructor(client) {
        /** Interactive elements on the homescreen. */
        this.homescreen = {};
        /** Toggleable settings. */
        this.settings = {};
        /** The canvas to draw on. */
        /** @ts-ignore */
        this.canvas = document.getElementById("canvas");
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
                arrowRight: document.getElementById("arrow-left"),
                /** The name of the ability. */
                abilityName: document.getElementById("ability-name"),
                /** The description of the ability. */
                abilityDesc: document.getElementById("ability-desc"),
                /** The selector icons of the abilities. */
                abilitySelector: document.getElementById("ability-name")
            }
        };
        this.settings = {
            /** The div which contains toggleable settings. */
            settings: document.getElementById("settingsModal"),
        };
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
    }
    loop() {
        var _a, _b;
        console.log(this, this.client, this.client.canvas, (_a = this.client.canvas) === null || _a === void 0 ? void 0 : _a.render);
        (_b = this.client.canvas) === null || _b === void 0 ? void 0 : _b.render();
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