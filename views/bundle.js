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

const Config = {
    HomeScreen: {
        /** The amount of stars to be drawn. */
        starCount: 100,
        /** The holder for every star. */
        stars: [],
        /** The increment for all of the stars */
        increment: 0.1,
    },
    Gamemodes: {
        List: ["Duel", "FFA", "Boss"],
        Pointer: 0,
    },
    Characters: {
        List: ["Knight", "Priest", "Assassin"],
        Pointer: 0,
    }
};

/** DOM ELEMENTS */

/** Home screen elements */
const Gamemodes = document.getElementById("gamemodes");

const characterName = document.getElementById("character-name"),
    characterSprite = document.getElementById("character-sprite");

const arrowLeft = document.getElementById("arrow-left"),
    arrowRight = document.getElementById("arrow-right");

const Animations = {
    RenderCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.TAU);
        ctx.fill();
    },

    Setup() {
        /**
         * Sets up the game. Ran once before the requestAnimationFrame loop.
         */

        /** Sets up the WebSocket Manager.
         * TODO(Altanis|Feature): Handle WebSocket connections.
         */

        /** Adds a listener to each gamemode, selects them when clicked. 
         * TODO(Altanis|Feature): Connect to a new WebSocket when a gamemode is selected.
         */
        for (let i = Gamemodes.children.length; i--;) {
            const child = Gamemodes.children[i];

            child.addEventListener("click", function () {
                Config.Gamemodes.Pointer = i;
                for (const sibling of this.parentElement.children) sibling.classList.remove("selected");
                this.classList.add("selected");
            });
        }

        /** Adds a listener to each arrow, incrementing/decrementing the pointer to each character. */
        arrowLeft.addEventListener("click", function () {
            Config.Characters.Pointer = (--Config.Characters.Pointer + Config.Characters.List.length) % Config.Characters.List.length;
            console.log(Config.Characters.Pointer);
        });

        arrowRight.addEventListener("click", function () {
            Config.Characters.Pointer = ++Config.Characters.Pointer % Config.Characters.List.length;
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
            ctx.fillStyle = "#fff";
            Animations.RenderCircle(star.x, star.y, star.radius);
            star.radius += Config.HomeScreen.increment;
            if (star.radius >= 2.5) {
                Config.HomeScreen.stars.splice(i, 1);
            }
        }

        /** 
         * This section manages gamemodes and how they're displayed.
         */
        Gamemodes.children[Config.Gamemodes.Pointer].classList.add("selected");

        /**
         * This section manages the character selection.
         */
        characterName.innerText = Config.Characters.List[Config.Characters.Pointer];
        const src = `img/${characterName.innerText}.gif`;
        if (!characterSprite.src.includes(src)) characterSprite.src = src;
    }
}

Animations.Setup();

function UpdateGame() {
    Animations.HomeScreen();
    requestAnimationFrame(UpdateGame);
}

UpdateGame();