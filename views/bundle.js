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
    },
    Arena: {
        /** The dimensions of the arena. */
        arenaBounds: 5000,
    },
    Audio: {
        List: ["ffa"],
        Pointer: 0,
    },
    
    DisplayDisconnect: false,
    CurrentPhase: 0 // [0: Homescreen, 1: Arena, 2: Death]
};

const Data = {
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
        ]
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
    }
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

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
}

window.addEventListener("resize", resize);
resize();

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
            
            // TODO(Altanis): Change abilities based on character.
            const characterAbilities = Data[characterName.innerText].Abilities;
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
            abilityName.innerText = Data[characterName.innerText].Abilities[value].name;
            abilityDesc.innerText = Data[characterName.innerText].Abilities[value].description;
            
            this._ap = value;
        }
    }
});

/** DOM ELEMENTS */

/** Home screen elements */
const HomeScreen = document.getElementById("homescreen"),
Play = document.getElementById("play"),
NameInput = document.getElementById("name"),
Gamemodes = document.getElementById("gamemodes"),
DisconnectScreen = document.getElementById("disconnect");

const characterName = document.getElementById("character-name"),
characterSprite = document.getElementById("character-sprite");

const arrowLeft = document.getElementById("arrow-left"),
arrowRight = document.getElementById("arrow-right");

const abilityName = document.getElementById("ability-name"),
abilityDesc = document.getElementById("ability-desc"),
abilities = document.getElementById("ability");

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
}

const AudioManager = class {
    constructor() {
        this.audio = new Audio();
    }
    
    play(name) {
        this.audio.src = `assets/audio/${name}.mp3`;
        this.audio.play();
    }
};

const Player = {
    /** The ID of the player */
    id: 0,
    /** The name of the player */
    name: "Knight",
    /** The ID of the player. */
    id: null,
    /** The position of the player */
    position: null,
    /** The angle at which the player is facing at (from -Math.PI to Math.PI) */
    angle: 0,
}

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
            console.log(data);
            SwiftStream.Set(data);
            this.parse();
        });
    }
    
    parse() {
        const header = SwiftStream.ReadI8();
        switch (header) {
            case 0x00: { // UPDATE HEADER
                if (SwiftStream.ReadI8() === 0x00) { // PLAYER UPDATE
                    const id = SwiftStream.ReadI8(); // Player ID
                    let length = SwiftStream.ReadI8(); // Length of fields
                    
                    console.log(length);
                    
                    for (; length--;) {
                        const field = SwiftStream.ReadI8();
                        switch (field) {
                            case 0x00: { // POSITION
                                const x = SwiftStream.ReadFloat32();
                                const y = SwiftStream.ReadFloat32();
                                
                                console.log(`Entity ${id} is located at (${x}, ${y})`);
                                
                                if (!Player.position) { // Start Game
                                    HomeScreen.style.display = "none";
                                    Config.CurrentPhase = 1;
                                }

                                Player.id = id;
                                Player.position = { x, y };
                                break;
                            }
                        }
                    }
                }
                
                break;
            }
            default: console.log(header);
        }
    }
    
    /** Sends a packet to the server informing that the client wants to spawn. */
    play() {    
        this.socket.send(SwiftStream.WriteI8(0x00).WriteCString("Knight").WriteI8(Config.Characters.CharacterPointer).WriteI8(Config.Characters.AbilityPointer).Write());
    }
}

const SocketManager = new WebSocketManager("ws://localhost:8080");
const audio = new AudioManager();

const Game = {
    RenderCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.TAU);
        ctx.fill();
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
            
            child.addEventListener("click", function () {
                Config.Gamemodes.Pointer = i;
                for (const sibling of this.parentElement.children) sibling.classList.remove("selected");
            });
        }
        
        /** Adds a listener to each arrow, incrementing/decrementing the pointer to each character. */
        arrowLeft.addEventListener("click", function () {
            Config.Characters.CharacterPointer = ((Config.Characters.CharacterPointer - 1) + Config.Characters.List.length) % Config.Characters.List.length;
        });
        
        arrowRight.addEventListener("click", function () {
            console.log(Config.Characters.CharacterPointer);
            Config.Characters.CharacterPointer = (Config.Characters.CharacterPointer + 1) % Config.Characters.List.length;
        });
        
        /** Clicks play on enter. */
        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && document.activeElement === NameInput) Play.click();
        });
        /** Adds a listener to the Play button to start the game. */
        Play.addEventListener("click", function () {
            SocketManager.play();
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

    RenderPlayer() {
        /*ctx.drawImage(frames.buffer, 0, 0);
        image.frameIdx = Math.floor((Date.now() - image.startTime) / image.delay);
        if (image.frameIdx >= image.frames.length) {
            image.frameIdx = 0;
            image.startTime = Date.now();
        }

        ctx.drawImage(image, image.frameIdx * image.width / image.frames, 0, image.width / image.frames, image.height, 0, 0, canvas.width, canvas.height);*/
    },
    
    Arena() {
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
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // RENDER INBOUNDS:
        ctx.fillStyle = "#000000";

        const xOffset = (canvas.width - Player.position.x) / 2;
        const yOffset = (canvas.height - Player.position.y) / 2;

        ctx.fillRect(xOffset, yOffset, Config.Arena.arenaBounds / 2, Config.Arena.arenaBounds / 2);


        /** This section renders the player. */
        const character = "Knight";
        const cache = ImageCache.get(character);

        // TODO(ALTANIS): Abandon GIFs, futile.


        // if (!cache) {
            /** Cache the image, and make it suitable for animation. */

            /*const image = new Image();
            image.src = `assets/img/characters/gifs/${character}.gif`;
            image.addEventListener("load", function() {
                ImageCache.set(character, image);

                const buffer = document.createElement("canvas").getContext("2d");
                buffer.canvas.width = image.width;
                buffer.canvas.height = image.height;
                buffer.drawImage(image, 0, 0);
                const imageData = buffer.getImageData(0, 0, buffer.canvas.width, buffer.canvas.height);

                image.frames = 0;
                image.delay = 0;

                for (let i = 0; i < imageData.data.length; i += 4) {
                    const alpha = imageData.data[i + 3];
                    if (alpha === 0) image.frames++;
                    else if (alpha > 0) image.delay += alpha;
                }

                console.log("Parsed image, frames:", image.frames, "delay:", image.delay);

                image.startTime = Date.now();
                image.frameIdx = 0;
                Game.RenderPlayer(image);
            });*/
        // } else Game.RenderPlayer(cache);
     }
}

Game.Setup();

function UpdateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (Config.CurrentPhase) {
        case 0: Game.HomeScreen(); break;
        case 1: Game.Arena(); break;
    }
    requestAnimationFrame(UpdateGame);
}

UpdateGame();