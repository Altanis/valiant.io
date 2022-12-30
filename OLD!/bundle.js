const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/** DOM ELEMENTS */
const HomeScreen = document.getElementById("homescreen");

const Gamemodes = document.getElementById("gamemodes");

const Character = document.getElementById("character");
const CharacterName = document.getElementById("character-name");

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;

    HomeScreen.style.height = canvas.height / 1.33 + "px";
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
        List: ["Duel", "FFA", "Boss Rush"],
        Pointer: 0,
    },
    Characters: {
        List: ["Knight", "Priest", "Assassin"],
        Pointer: 0,
    }
};

const Animations = {
    RenderCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.TAU);
        ctx.fill();
    },

    /** Sets up the game. */
    Setup() {
        /** Highlights the gamemode selected. */
        Gamemodes.children[Config.Gamemodes.Pointer].classList.add("selected");

        /** Sets the current character client is playing. */
        CharacterName.innerText = Config.Characters.List[Config.Characters.Pointer];
        const CharacterImage = new Image(100, 100);
        CharacterImage.src = `img/${CharacterName.innerText}.gif`;
        // Character.appendChild(CharacterImage);
    },

    HomeScreen() {
        /**
         * This function draws the home screen animation. It resembles space while moving quick in it.
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
    }
}


function UpdateGame() {
    Animations.HomeScreen();
    Animations.Setup();

    requestAnimationFrame(UpdateGame);
}

UpdateGame();