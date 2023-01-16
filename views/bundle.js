console.time();
const Config = {
    WebSocket: {
        CloseEvents: {
            3000: "The server has detected multiple connections by you. Please terminate any existing connections.",
            3001: "The server is full.",
            3002: "The server has detected a malformed request made by you. Please refresh.",
            3003: "The server has detected that you are a banned player.",
            3006: "An unknown error has occurred. Please refresh."
        }
    },
    HomeScreen: {
        /** The amount of stars to be drawn. */
        starCount: 100,
        /** The holder for every star. */
        stars: [],
        /** The increment for all of the stars */
        increment: 0.1,
    },
    Gamemodes: {
        List: ["FFA"],
        Pointer: 0,
    },
    Characters: {
        List: ["Knight", "Priest", "Assassin"],
        _cp: 0,
        MagicFrames: 8,
        MagicDelay: 4, // 15 frames per second
    },
    Arena: {
        /** The dimensions of the arena. */
        arenaBounds: 14400,
        /** The spacing for the grid system. */
        gridSize: 100,
    },
    Audio: {
        List: ["ffa"],
        Pointer: 0,
    },
    
    DisplayDisconnect: false,
    CurrentPhase: 0, // [0: Homescreen, 1: Arena, 2: Death]
    Options: {
        hideGrid: false,
    },
    FPS: {
        fpsArr: [],
        fps: 0,
    }
};

const Data = {
    /** PLAYERS */
    Characters: {
        Knight: {
            Abilities: [
                {
                    name: "Dual Wield",
                    description: "Attack with double the power.",
                    src: "assets/img/abilities/dual_wield.png"
                },
                {
                    name: "Charge",
                    description: "Bash into a foe with your shield.",
                    src: "assets/img/abilities/charge.png"
                }
            ],
            Stats: {
                Health: 7,
                Armor: 6,
                Energy: 250,
            }
        },
        Priest: {
            Abilities: [
                {
                    name: "Castor",
                    description: "Attack with double the power.",
                    src: "assets/img/abilities/dual_wield.png"
                },
            ]
        },
        Assassin: {
            Abilities: [
                {
                    name: "Dual Wield",
                    description: "Attack with double the power.",
                    src: "assets/img/abilities/dual_wield.png"
                },
                {
                    name: "Charge",
                    description: "Bash into a foe with your shield.",
                    src: "assets/img/abilities/charge.png"
                },
            ]
        },
    },

    /** WEAPONS */
    Weapons: [
        {
            name: "Rusty Blade",
            type: "melee",
            rarity: "common",
            damage: 10,
            range: Math.PI / 4,
            speed: 30,
            src: "assets/img/weapons/rusty_blade.png"
        }
    ]
};

/** BUFFERS: Used to convert between different byte-lengths. */
const conversion = new ArrayBuffer(4);
const u8 = new Uint8Array(conversion);
const f32 = new Float32Array(conversion);

/** SwiftStream, an efficient binary protocol manager written by Altanis. */
const SwiftStream = new (class {
    /** The buffer SwiftStream is using. */
    buffer = new Uint8Array(4096);
    /** The position at which the buffer is being read. */
    at = 0;
    /** UTF8 Decoder. */
    TextDecoder = new TextDecoder();
    /** UTF8 Encoder. */
    TextEncoder = new TextEncoder();
    
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
        while (this.buffer[this.at++]);
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
});

Math.TAU = Math.PI * 2;
Math.randomRange = (min, max) => Math.random() * (max - min) + min;

/** Observe mutations. */
Object.defineProperties(Config.Characters, {
    CharacterPointer: {
        get() { return this._cp },
        set(value) {
            characterName.innerText = Config.Characters.List[value];
            const src = `assets/img/characters/gifs/${characterName.innerText}.gif`;
            characterSprite.src = src;
            
            const characterAbilities = Data.Characters[characterName.innerText].Abilities;
            abilities.innerHTML = "";
            for (const ability of characterAbilities) {
                const abilityElement = document.createElement("img");
                abilityElement.width = abilityElement.height = 50;
                abilityElement.src = ability.src;
                abilityElement.classList.add("character-ability");
                abilityElement.addEventListener("click", () => {
                    const index = characterAbilities.indexOf(ability);
                    Config.Characters.AbilityPointer = index;
                });
                abilities.appendChild(abilityElement);
            }
            
            Config.Characters.AbilityPointer = 0;
            abilityName.innerText = characterAbilities[Config.Characters.AbilityPointer].name;
            abilityDesc.innerText = characterAbilities[Config.Characters.AbilityPointer].description;
            
            this._cp = value;
        },
    },
    AbilityPointer: {
        get() { return this._ap },
        set(value) {
            abilities.children[Config.Characters.AbilityPointer]?.classList.remove("selected");
            abilities.children[value]?.classList.add("selected");
            abilityName.innerText = Data.Characters[characterName.innerText].Abilities[value].name;
            abilityDesc.innerText = Data.Characters[characterName.innerText].Abilities[value].description;
            
            this._ap = value;
        }
    }
});

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpAngle(angle1, angle2, t) {
    const diff = -((angle1 - angle2 + Math.PI * 3) % (Math.TAU) - Math.PI);
    return angle1 + diff * t;
}

console.timeEnd();

/** DOM ELEMENTS */
console.time();
/** Home screen elements */
const HomeScreen = document.getElementById("homescreen"),
    SettingsModal = document.getElementById("settingsModal"),
    Play = document.getElementById("play"),
    NameInput = document.getElementById("name"),
    Gamemodes = document.getElementById("gamemodes"),
    DisconnectScreen = document.getElementById("disconnect"),
    Settings = document.getElementById("settings"),
    Back = document.getElementById("back");

/** Settings options */
const hideGrid = document.getElementById("hideGrid");

const characterName = document.getElementById("character-name"),
    characterSprite = document.getElementById("character-sprite");

const arrowLeft = document.getElementById("arrow-left"),
    arrowRight = document.getElementById("arrow-right");

const abilityName = document.getElementById("ability-name"),
    abilityDesc = document.getElementById("ability-desc"),
    abilities = document.getElementById("ability");

/** Game eleemnts */
/** Game utils */   
const stats = document.getElementById("stats");

const healthBar = document.getElementById("health"),
    armorBar = document.getElementById("armor"),
    energyBar = document.getElementById("energy");

let el = [];
document.querySelectorAll(".progress-bar").forEach((p, i) => el[i] = p.children[1]);
console.log(el);
let [healthText, armorText, energyText] = el;

const utils = document.getElementById("utils"),
    fps = document.getElementById("fps"),
    ping = document.getElementById("ping");

/** Image Caching */
const ImageCache = new Map();

const Storage = {
    get(key) {
        return localStorage.getItem(key);
    },
    set(key, value) {
        localStorage.setItem(key, value);
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    has(key) {
        return localStorage.hasOwnProperty(key);
    }
};

hideGrid.checked = Config.Options.hideGrid = Storage.get("hideGrid") === "true";

const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

const mapCanvas = document.getElementById("mapDisplay");
/** @type {CanvasRenderingContext2D} */
const mapCtx = mapCanvas.getContext("2d");

let gridCanvas, gridCtx;

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
}

window.addEventListener("resize", resize);
resize();

const AudioManager = class {
    constructor() {
        this.audio = new Audio();
    }
    
    play(name) {
        this.audio.src = `assets/audio/${name}.mp3`;
        this.audio.play();
    }
};

const Player = class {
    constructor(name) {
        this.id = null;
        this.character = Data.Characters[name];
        this.position = {
            old: { x: null, y: null, ts: null },
            current: { x: null, y: null, ts: null },
        };
        this.angle = {
            old: { measure: null, ts: null, lerpFactor: 0, direction: -1, cycles: 0 },
            current: { measure: null, ts: null, lerpFactor: 0, direction: -1, cycles: 0 },
        };
        this.attack = {
            state: false,
            attacking: false,
            direction: 1,
            changeState: false,
            onlyOnce: false,
            mPos: false,
        };
        this.weapon = null;
        this.surroundings = []; // { type, x, y }
    }
}

const player = new Player("Knight");

Object.defineProperties(Player, {
    /** Character index */
    character: {
        get() { return Config.Characters.CharacterPointer },
        set() { throw new Error("why is this being set?") },
    },
    /** Ability index */
    ability: {
        get() { return Config.Characters.CharacterPointer },
        set() { throw new Error("why is this being set?") },
    },
})

const WebSocketManager = class {
    constructor(url) {
        this.url = url; // The URL to connect to.
        this.socket = new WebSocket(url); // The WebSocket connection.
        this.socket.binaryType = "arraybuffer";
        this.migrations = 0; // The amount of migrations to a new server. Resets when a connection is successfully established.
        
        this.handle();
    }
    
    migrate(url) {
        if (++this.migrations > 3) return console.log("Failed to reconnect to the server. Please refresh.");
        
        this.url = url;
        this.socket.close(4999, "Migrating to a new server.");
        
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";
        
        this.handle();
    }
    
    handle() {
        this.socket.addEventListener("open", () => {
            console.log("Connected to server!");
            this.migrations = 0;
            HomeScreen.style.display = "block";
            canvas.style.display = "block";
            DisconnectScreen.style.display = "none";
        });
        
        this.socket.addEventListener("close", event => {
            if (event.code === 4999) return; // Migrating to a new server.
            
            if ([3001, 3003, 3006].includes(event.code)) return this.migrate(this.url);
            console.log(Config.WebSocket.CloseEvents[event.code] || "An unknown error has occurred. Please refresh.");
            
            /** Inform client a connection was not able to be sustained. */
            if (!Config.DisplayDisconnect) return;
            HomeScreen.style.display = "none";
            canvas.style.display = "none";
            document.getElementById("disconnect-message").innerText = Config.WebSocket.CloseEvents[event.code] || "An unknown error has occurred. Please refresh.";
            DisconnectScreen.style.display = "block";
        });
        
        this.socket.addEventListener("error", event => {
            console.log("An error has occured during the connection:", event);
            this.migrate(this.url);
        });
        
        this.socket.addEventListener("message", ({ data }) => {
            data = new Uint8Array(data);
            SwiftStream.Set(data);
            this.parse();
        });
    }
    
    parse() {
        const header = SwiftStream.ReadI8();
        switch (header) {
            case 0x00: { // UPDATE HEADER
                const updateReq = SwiftStream.ReadI8();
                if (updateReq === 0x00) { // PLAYER UPDATE
                    const id = SwiftStream.ReadI8(); // Player ID
                    let length = SwiftStream.ReadI8(); // Length of fields
                    
                    for (; length--;) {
                        const field = SwiftStream.ReadI8();
                        switch (field) {
                            case 0x00: { // POSITION
                                const x = SwiftStream.ReadFloat32();
                                const y = SwiftStream.ReadFloat32();
                                
                                if (player.position.old.x === null) { // Start Game
                                    HomeScreen.style.display = "none";
                                    Config.CurrentPhase = 1;
                                }
                                
                                player.position.old = player.position.current;
                                player.position.current = { x, y, ts: Date.now() };
                                
                                player.id = id;
                                break;
                            }
                            case 0x01: { // ATTACKING
                                player.attack.changeState = SwiftStream.ReadI8() === 0x01;
                                if (!player.attack.attacking && player.attack.changeState) player.attack.attacking = true;
                                break;
                            }
                            case 0x02: { // WEAPON
                                player.weapon = Data.Weapons[SwiftStream.ReadI8()];
                                if (!player.weapon) throw new Error("Could not find weapon.");
                            }
                        }
                    }
                }
                
                const surroudings = updateReq === 0x00 ? SwiftStream.ReadI8() : updateReq;
                if (surroudings === 0x01) { // surroundings near player
                    length = SwiftStream.ReadI8() || 0; // Length of surroundings
                    for (; length--;) {
                        const entity = SwiftStream.ReadI8();
                        player.surroundings = [];

                        switch (entity) {
                            case 0x00: { // PLAYER
                                break;
                            }
                            case 0x01: { // box
                                const x = SwiftStream.ReadFloat32();
                                const y = SwiftStream.ReadFloat32();

                                player.surroundings.push({
                                    type: "Box",
                                    x,
                                    y
                                });
                            }
                        }
                    }
                }
                
                break;
            }
            default: console.log(header);
        }
        
        SwiftStream.Clear();
    }
    
    /** Sends a packet to the server informing that the client wants to spawn. */
    play() {    
        this.socket.send(SwiftStream.WriteI8(0x00).WriteCString("Knight").WriteI8(Config.Characters.CharacterPointer).WriteI8(Config.Characters.AbilityPointer).Write());
        stats.style.display = "flex";
        utils.style.display = "block";

        healthText.innerText = `${player.character.Stats.Health}/${player.character.Stats.Health}`;
        armorText.innerText = `${player.character.Stats.Armor}/${player.character.Stats.Armor}`;
        energyText.innerText = `${player.character.Stats.Energy}/${player.character.Stats.Energy}`;
    }
}

const SocketManager = new WebSocketManager("ws://localhost:8080");
const audio = new AudioManager();

console.timeEnd();

console.time();

const Game = {
    RenderCircle(x, y, radius, context = ctx) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.TAU);
        context.fill();
    },
    
    Setup() {
        /**
        * Sets up the game. Ran once before the requestAnimationFrame loop.
        */

        /** Sets up the character modal. */
        Config.Characters.CharacterPointer = 0;
        
        /** Adds a listener to each gamemode, selects them when clicked. 
        * TODO(Altanis|Feature): Connect to a new WebSocket when a gamemode is selected.
        */
        for (let i = Gamemodes.children.length; i--;) {
            const child = Gamemodes.children[i];
            if (child.classList.contains("disabled")) continue;
            if (Config.Gamemodes.Pointer === i) child.classList.add("selected");

            child.addEventListener("click", function () {
                Config.Gamemodes.Pointer = i;
                for (const sibling of this.parentElement.children) sibling.classList.remove("selected");
                this.classList.add("selected");
            });
        }
        
        /** Adds a listener to each arrow, incrementing/decrementing the pointer to each character. */
        arrowLeft.addEventListener("click", function () {
            Config.Characters.CharacterPointer = ((Config.Characters.CharacterPointer - 1) + Config.Characters.List.length) % Config.Characters.List.length;
        });
        
        arrowRight.addEventListener("click", function () {
            Config.Characters.CharacterPointer = (Config.Characters.CharacterPointer + 1) % Config.Characters.List.length;
        });
        
        /** Adds a listener to the Play button to start the game. */
        Play.addEventListener("click", function () {
            SocketManager.play();
            mapCanvas.style.display = "block";
        });

        /** Adds a listener to the Settings button to open the Settings modal. */
        Settings.addEventListener("click", function () {
            SettingsModal.style.display = "flex";
            HomeScreen.style.display = "none";
        });

        Back.addEventListener("click", function () {
            SettingsModal.style.display = "none";
            HomeScreen.style.display = "block";
        });

        /** Adds listeners to all options. */
        hideGrid.addEventListener("click", function () {
            Storage.set("hideGrid", hideGrid.checked = Config.Options.hideGrid = !Config.Options.hideGrid);
            
        });
    },
    
    HomeScreen() {
        /**
        * This section draws the home screen animation. It resembles space while moving quick in it.
        * To make the effect that space is moving, we need to:
        * 1. Draw a black background
        * 2. Draw big stars with varying radii
        * 3. Increase their radii by small amounts to simulate moving close to them
        * 4. Generate new stars when the old ones become big
        */
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FFFFFF";
        if (Config.HomeScreen.stars.length !== Config.HomeScreen.starCount) {
            for (let i = Config.HomeScreen.starCount - Config.HomeScreen.stars.length; --i;) {
                Config.HomeScreen.stars.push({
                    x: Math.randomRange(0, canvas.width),
                    y: Math.randomRange(0, canvas.height),
                    radius: Math.randomRange(0.1, 1.5)
                });
            }
        }
        
        for (let i = Config.HomeScreen.stars.length; i--;) {
            const star = Config.HomeScreen.stars[i];
            Game.RenderCircle(star.x, star.y, star.radius);
            star.radius += Config.HomeScreen.increment;
            if (star.radius >= 3) {
                Config.HomeScreen.stars.splice(i, 1);
            }
        }
    },
    
    RenderPlayer(angle, cache, weapon) {
        // RENDER PLAYER:
        if (!cache) return;
        
        if (++cache[0] >= Config.Characters.MagicDelay) {
            cache[1] = ++cache[1] % Config.Characters.MagicFrames;
            cache[0] = 0;
        }

        if (!cache[2][cache[1]]) return;
        ctx.save();         
        
        angle = ((angle + Math.PI * 3) % Math.TAU - Math.PI);
        const scaleX = (angle > Math.PI / 2 && angle < Math.PI) || (angle < -Math.PI / 2 && angle > -Math.PI) ? -1 : 1; // TODO(Altanis): Fix for attacking.
        player.attack.attacking && console.log(angle, scaleX);
        ctx.translate((canvas.width - 150) / 2 + 75, (canvas.height - 150) / 2 + 75);        
        ctx.scale(scaleX, 1);
        
        ctx.drawImage(cache[2][cache[1]], -75, -75, 150, 150);
        ctx.restore();

        // RENDER WEAPON:
        // Render weapon next to player:
        if (!weapon) return;

        ctx.save();
        ctx.translate((canvas.width) / 2, (canvas.height + 50) / 2);
        ctx.rotate(angle);
        ctx.drawImage(weapon, 0, 0, 100, 20);
        ctx.restore();
    
        // Render tracer behind sword:
        /*if (player.attack.attacking) {
            ctx.strokeStyle = "blue";
            console.log(Math.cos(player.angle.current.measure), Math.sin(player.angle.current.measure));
            ctx.lineTo(Math.cos(player.angle.current.measure), Math.sin(player.angle.current.measure));
            ctx.stroke();
        }*/

        /*if (!cache[2][cache[1]]) return;
        ctx.drawImage(cache[2][cache[1]], (canvas.width - 150) / 2, (canvas.height - 150) / 2, 150, 150);*/
        // TODO(Altanis): Render name.
        /*ctx.font = "30px Ubuntu, Orbitron";
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.lineWidth = 8;
        
        const xOffset = player.position.current.x - ((canvas.width - player.position.current.x) / 2);
        const yOffset = player.position.current.y - ((canvas.height - player.position.current.y) / 2) - 150 - 34;
        
        ctx.fillText("altanis", xOffset, yOffset);*/
    },
    
    // TODO(Altanis): fix relative pos
    RenderSurroundings(pos) { 
        ctx.save();
        ctx.translate(-pos.x, -pos.y);
        for (const surrounding of player.surroundings) {
            const { type, x, y } = surrounding;
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, 200, 200);
        }
        ctx.restore();
    },
    /*RenderSurroundings(pos) {
        for (const surrounding of player.surroundings) {
            const { type, x, y } = surrounding;

            ctx.fillStyle = "white";
            ctx.fillRect(x - pos.x, y - pos.y, 200, 200);
        }
    },*/

    Arena(delta) {
        /**
        * This section draws the arena. It resembles the space every entity is in.
        */
        
        /**  
        * 1. Renders outbound as entire canvas.
        * 2. Calculates the x and y offsets for the player to view relative to their position.
        * At (0, 0), the x and y offsets of the arena should be half of their respective dimensions (height/width). 
        * 3. Apply inbounds, dimensions are half of the arena bounds.
        */
        
        // RENDER OUTBOUNDS:
        ctx.fillStyle = "rgba(12, 50, 54, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // RENDER INBOUNDS:  
        ctx.strokeStyle = "#2F8999";
        ctx.lineWidth = 10;        
        ctx.fillStyle = "rgb(5,28,31)";
        
        // LERP COORDS:
        let pos, angle;
        const frame = Date.now() - (1000 / 60);
        if (frame < player.position.old.ts) pos = player.position.old;
        else if (frame > player.position.current.ts) pos = player.position.current;
        else {
            pos = {
                x: player.position.old.x + (player.position.current.x - player.position.old.x) * 0.5,
                y: player.position.old.y + (player.position.current.y - player.position.old.y) * 0.5
            };
        }

        if (frame < player.angle.old.ts) angle = player.angle.old.measure;
        else if (frame > player.angle.current.ts) angle = player.angle.current.measure;
        else {
            angle = lerpAngle(player.angle.old.measure, player.angle.current.measure, (frame - player.angle.old.ts) / (player.angle.current.ts - player.angle.old.ts));
        }
        
        const xOffset = (canvas.width - pos.x) / 2;
        const yOffset = (canvas.height - pos.y) / 2;
        
        ctx.strokeStyle = "#2F8999";
        ctx.strokeRect(xOffset, yOffset, (Config.Arena.arenaBounds + 150) / 2, (Config.Arena.arenaBounds + 150) / 2);
        ctx.fillRect(xOffset, yOffset, (Config.Arena.arenaBounds + 150) / 2, (Config.Arena.arenaBounds + 150) / 2);

        // RENDER MINIMAP:
        mapCtx.fillStyle = "#FFFFFF";

        const minimapX = pos.x * mapCanvas.width / Config.Arena.arenaBounds;
        const minimapY = pos.y * mapCanvas.height / Config.Arena.arenaBounds;

        Game.RenderCircle(minimapX, minimapY, 2, mapCtx);

        // CALCULATE FPS:
        if (Config.FPS.fpsArr.length > 10) Config.FPS.fpsArr.shift();
        Config.FPS.fpsArr.push(1000 / delta);
        fps.innerText = `${Config.FPS.fps = (Config.FPS.fpsArr.reduce((a, b) => a + b) / Config.FPS.fpsArr.length).toFixed(1)} FPS`;

        /** This section renders the player. */
        const character = "Knight";
        const weapon = player.weapon;
        
        const cache = ImageCache.get(character);
        if (!cache) {
            ImageCache.set(character, [0, 0, []]);
            for (let i = Config.Characters.MagicFrames; i--;) {
                const image = new Image();
                image.src = `img/characters/frames/${character}/${character}${i + 1}.png`;
                image.addEventListener("load", function() {
                    ImageCache.get(character)[2].push(image);
                });
            }
        }

        const weaponCache = ImageCache.get(weapon.name);
        if (!weaponCache) {
            const image = new Image();
            image.src = weapon.src;
            image.addEventListener("load", function () {
                ImageCache.set(weapon.name, image);
            });
        }
        
        Game.RenderPlayer(angle, cache, weaponCache);
        player.surroundings.length && Game.RenderSurroundings(pos, xOffset, yOffset);

        /** This section calculates and sends the angle and movement directions. */
        if (ACTIVE_KEYS.size) {
            const buffer = SwiftStream.WriteI8(0x01);
            ACTIVE_KEYS.forEach(dir => buffer.WriteI8(dir));
            SocketManager.socket.send(buffer.Write());
        }

        if (player.attack.state !== player.attack.attacking) {
            SocketManager.socket.send(SwiftStream.WriteI8(0x03).WriteI8(player.attack.state).Write());
        }
        
        // TODO(Altanis): Optimize object redefinitions.
        if (player.mouse && !player.attack.attacking) {
            let old = player.angle.old.measure;
            const measure = player.attack.mPos = Math.atan2(player.mouse.y - (canvas.height / 2), player.mouse.x - (canvas.width / 2));
            if (old !== measure) {
                SocketManager.socket.send(SwiftStream.WriteI8(0x02).WriteFloat32(measure).Write());
            
                player.angle.old = player.angle.current;
                player.angle.current = { measure, ts: Date.now(), lerpFactor: player.angle.current.lerpFactor, direction: player.angle.current.direction, cycles: player.angle.current.cycles };
            }
        }

        if (player.attack.attacking) {
            player.angle.old = player.angle.current;
            if (!player.attack.mPos) player.attack.mPos = Math.atan2(player.mouse.y - (canvas.height / 2), player.mouse.x - (canvas.width / 2));

            let mPos = player.attack.mPos;
            let posRange = mPos + weapon.range;
            let negRange = mPos - weapon.range;

            if (posRange > Math.PI) posRange -= Math.TAU;
            if (negRange < -Math.PI) negRange += Math.TAU;

            let angle = lerpAngle(posRange, negRange, player.angle.current.lerpFactor);

            player.angle.current.lerpFactor += 5 * (weapon.speed / 1000) * player.angle.current.direction;
            if (player.angle.current.lerpFactor >= 1 || player.angle.current.lerpFactor <= 0) {
                player.angle.current.direction *= -1;
                if (++player.angle.current.cycles % 2 === 0) {
                    player.attack.attacking = player.attack.changeState;
                    if (player.attack.onlyOnce) player.attack.onlyOnce = player.attack.changeState = player.attack.attacking = false;
                }
            }

            player.angle.current = {
                measure: angle,
                ts: Date.now(),
                lerpFactor: player.angle.current.lerpFactor,
                direction: player.angle.current.direction,
                cycles: player.angle.current.cycles
            };
        } else player.angle.current.lerpFactor = 0.5;

        /*if (player.attack.attacking) {
            player.angle.old = player.angle.current;
            let mPos = Math.atan2(player.mouse.y - (canvas.height / 2), player.mouse.x - (canvas.width / 2));
            let angle = lerpAngle(mPos + Math.PI / 2, mPos - Math.PI / 2, player.angle.current.increment % Math.PI / 2);
            
            player.angle.current.increment += weapon.speed;
            if (player.angle.current.increment >= Math.PI / 2) {
                player.attack.direction = -player.attack.direction;
            }

            angle += player.attack.direction * weapon.speed;
            console.log(angle, player.angle.current.increment % Math.PI / 2)
            player.angle.current = { measure: angle, ts: Date.now(), increment: player.angle.current.increment };
        }*/
    }
}

const ATTACH_MAPS = new Map([
    /** Movement keys. */
    [38, 1],
    [87, 1],
    [39, 2],
    [68, 2],
    [40, 3],
    [83, 3],
    [37, 4],
    [65, 4],
]);

const ACTIVE_KEYS = new Set();
ACTIVE_KEYS.lerpFactor = 0;

document.addEventListener("keydown", function (event) {
    /** Play game. */
    switch (event.code) {
        case "Enter": {
            if (document.activeElement === NameInput && Play.style.display === "block") Play.click();
            break;
        }
        // TODO(Altanis): Make space only attack once.
        case "Space": {
            if (Config.CurrentPhase === 1) {
                player.attack.state = true;
                player.attack.onlyOnce = true;
            }
            return;
        }
    }
    
    /** Movement keys. */
    const attach = ATTACH_MAPS.get(event.which || event.keyCode);
    if (attach) {
        ACTIVE_KEYS.add(attach);
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    /** Movement keys. */
    const attach = ATTACH_MAPS.get(event.which || event.keyCode);
    if (attach) {
        ACTIVE_KEYS.delete(attach);
        event.preventDefault();
    }
});

document.addEventListener("mousemove", function (event) {
    player.mouse = { x: event.clientX, y: event.clientY }; // special only to client
});

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("mousedown", function(event) {
    if (Config.CurrentPhase === 1) player.attack.state = true;
    event.preventDefault();
});

canvas.addEventListener("mouseup", function(event) {
    if (Config.CurrentPhase === 1) player.attack.state = false;
    event.preventDefault();
});

Game.Setup();

let delta, lastUpdate;
function UpdateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    delta = Date.now() - (lastUpdate || 0);
    lastUpdate = Date.now();

    switch (Config.CurrentPhase) {
        case 0: Game.HomeScreen(); break;
        case 1: Game.Arena(delta); break;
    }
    requestAnimationFrame(UpdateGame);
}

UpdateGame();

console.timeEnd();