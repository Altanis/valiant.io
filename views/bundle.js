var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("Connection/SwiftStream", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /** BUFFERS: Used to convert between different byte lengths. */
    var conversion = new ArrayBuffer(4);
    var u8 = new Uint8Array(conversion);
    var f32 = new Float32Array(conversion);
    /** SwiftStream, an efficient binary protocol manager written by Altanis. */
    var SwiftStream = /** @class */ (function () {
        function SwiftStream() {
            /** The buffer SwiftStream is using. */
            this.buffer = new Uint8Array(4096);
            /** The position at which the buffer is being read. */
            this.at = 0;
            /** UTF8 Decoder. */
            this.TextDecoder = new TextDecoder();
            /** UTF8 Encoder. */
            this.TextEncoder = new TextEncoder();
        }
        SwiftStream.prototype.Set = function (buffer) {
            this.buffer = buffer;
            this.at = 0;
        };
        SwiftStream.prototype.Clear = function () {
            this.buffer = new Uint8Array(4096);
            this.at = 0;
        };
        /** READER */
        SwiftStream.prototype.ReadI8 = function () {
            return this.buffer[this.at++];
        };
        SwiftStream.prototype.ReadFloat32 = function () {
            u8.set(this.buffer.slice(this.at, this.at += 4));
            return f32[0];
        };
        SwiftStream.prototype.ReadUTF8String = function () {
            var start = this.at;
            while (this.buffer[this.at++])
                ;
            return this.TextDecoder.decode(this.buffer.slice(start, this.at - 1));
        };
        /** WRITER */
        SwiftStream.prototype.WriteI8 = function (value) {
            this.buffer[this.at++] = value;
            return this;
        };
        SwiftStream.prototype.WriteFloat32 = function (value) {
            f32[0] = value;
            this.buffer.set(u8, this.at);
            this.at += 4;
            return this;
        };
        SwiftStream.prototype.WriteCString = function (value) {
            this.buffer.set(this.TextEncoder.encode(value), this.at);
            this.at += value.length;
            this.buffer[this.at++] = 0;
            return this;
        };
        SwiftStream.prototype.Write = function () {
            var result = this.buffer.subarray(0, this.at);
            this.Clear();
            return result;
        };
        return SwiftStream;
    }());
    exports["default"] = SwiftStream;
});
define("Const/Enums", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
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
});
define("Connection/Connection", ["require", "exports", "Const/Enums"], function (require, exports, Enums_1) {
    "use strict";
    exports.__esModule = true;
    /** A representation of the WebSocket connection between the client and the server. */
    var Connection = /** @class */ (function (_super) {
        __extends(Connection, _super);
        function Connection(client, url) {
            var _this = _super.call(this) || this;
            /** The amount of retries attempted. */
            _this.retries = 0;
            _this.client = client;
            _this.socket = new WebSocket(url);
            _this.socket.binaryType = "arraybuffer";
            _this.handle();
            return _this;
        }
        Connection.prototype.migrate = function (url) {
            if (++this.retries > 3)
                return this.client.logger.err("[WS]: Threshold for retries has been exceeded. Please reload.");
            this.socket.close(4999);
            this.socket = new WebSocket(url);
            this.socket.binaryType = "arraybuffer";
            this.handle();
        };
        Connection.prototype.handle = function () {
            var _this = this;
            this.socket.addEventListener("open", function () {
                _this.client.logger.success("[WS]: Connected to server.");
            });
            this.socket.addEventListener("error", function () {
                _this.client.logger.err("[WS]: Connection to server has failed.");
                _this.migrate(_this.socket.url);
            });
            this.socket.addEventListener("close", function (event) {
                if (event.code === 4999)
                    return; // Internal migration code.
                console.log(Enums_1.CloseEvents[event.code] || Enums_1.CloseEvents.Unknown);
            });
            // handle messages later
        };
        return Connection;
    }(EventTarget));
    exports["default"] = Connection;
});
define("Utils/Logger", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /** A colorful logger to highlight important actions. */
    var Logger = {
        log: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log("%c[".concat(new Date().toLocaleDateString(), "]: ").concat(args.join(" ")), 'color: blue;');
        },
        err: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log("%c[".concat(new Date().toLocaleDateString(), "]: ").concat(args.join(" ")), 'color: red;');
        },
        success: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log("%c[".concat(new Date().toLocaleDateString(), "]: ").concat(args.join(" ")), 'color: green;');
        },
        warn: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log("%c[".concat(new Date().toLocaleDateString(), "]: ").concat(args.join(" ")), 'color: yellow;');
        },
        debug: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log(args.join(" "));
        }
    };
    exports["default"] = Logger;
});
define("Rendering/ElementManager", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /** Manages DOM elements. */
    var ElementManager = /** @class */ (function () {
        function ElementManager() {
            /** Interactive elements on the homescreen. */
            this.homescreen = {};
            /** Toggleable settings. */
            this.settings = {};
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
                settings: document.getElementById("settingsModal")
            };
        }
        return ElementManager;
    }());
    exports["default"] = ElementManager;
});
define("Rendering/CanvasManager", ["require", "exports", "Const/Enums"], function (require, exports, Enums_2) {
    "use strict";
    exports.__esModule = true;
    /** Constant for 360 degrees in radians. */
    var TAU = Math.PI * 2;
    /** Psuedorandom number in between two ranges. */
    var randomRange = function (min, max) { return Math.random() * (max - min) + min; };
    /** The canvas where nearly all visual representation is drawn. */
    var CanvasManager = /** @class */ (function () {
        function CanvasManager() {
            /** The canvas element. */
            /** @ts-ignore */
            this.canvas = document.getElementById("canvas");
            /** The context to draw on. */
            this.ctx = this.canvas.getContext("2d");
            /** The phase in which rendering is occuring. */
            this.phase = Enums_2.Phases.Homescreen;
            /** The difference in between two frame renders. */
            this.delta = 0;
            /** The stars on the homescreen. */
            this.stars = {
                count: 100,
                stars: [],
                radiusIncrement: 0.1
            };
            this.startAnimation();
        }
        CanvasManager.prototype.startAnimation = function () {
            this.delta = Date.now() - this.delta;
            switch (this.phase) {
                case Enums_2.Phases.Homescreen:
                    this.Homescreen();
                    break;
                case Enums_2.Phases.Arena:
                    this.Arena(this.delta);
                    break;
            }
            requestAnimationFrame(this.startAnimation.bind(this));
        };
        /** UTILITIES */
        CanvasManager.prototype.drawCircle = function (x, y, r, ctx) {
            if (ctx === void 0) { ctx = this.ctx; }
            ctx.beginPath();
            ctx.arc(x, y, r, 0, TAU);
            ctx.fill();
        };
        /** Renders the homescreen background (with pulsating stars). */
        CanvasManager.prototype.Homescreen = function () {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#FFFFFF";
            if (this.stars.stars.length !== this.stars.count) {
                for (var i = this.stars.count - this.stars.stars.length; --i;) {
                    this.stars.stars.push({
                        x: randomRange(0, this.canvas.width),
                        y: randomRange(0, this.canvas.width),
                        radius: randomRange(0, this.canvas.width)
                    });
                }
                for (var i = this.stars.stars.length; i--;) {
                    var star = this.stars.stars[i];
                    this.drawCircle(star.x, star.y, star.radius);
                    if (star.radius >= 3) {
                        this.stars.stars.splice(i, 1);
                    }
                }
            }
        };
        /** Renders the actual arena when spawned in. */
        CanvasManager.prototype.Arena = function (delta) { };
        return CanvasManager;
    }());
    exports["default"] = CanvasManager;
});
define("Client", ["require", "exports", "Connection/Connection", "Utils/Logger", "Rendering/ElementManager", "Rendering/CanvasManager"], function (require, exports, Connection_1, Logger_1, ElementManager_1, CanvasManager_1) {
    "use strict";
    exports.__esModule = true;
    /** A representation of the client currently on the site. */
    var Client = /** @class */ (function () {
        function Client() {
            /** The logging system in the IOStream. */
            this.logger = Logger_1["default"];
            /** The connection between the client and the server. */
            this.connection = new Connection_1["default"](this, "ws://localhost:8080");
            /** The canvas on which the client draws on. */
            this.canvas = new CanvasManager_1["default"]();
            /** The DOM element manager. */
            this.elements = new ElementManager_1["default"]();
        }
        return Client;
    }());
    exports["default"] = Client;
    ;
});
