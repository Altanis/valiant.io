import Client from "./Client";
import { Characters } from "./Const/Definitions";
import { Movement, Phases } from "./Const/Enums";
const client = new Client();

const KEYDOWN_MAP = new Map([
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

client.elements.canvas.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener("keydown", function (event) {
    switch (event.code) {
        case "Enter": {
            if (/** activeElement === NameInput && */ client.elements.homescreen.play.style.display === "block") {
                client.elements.homescreen.play.click();
            }

            break;
        }
    }

    const key = KEYDOWN_MAP.get(event.which || event.keyCode);
    if (key) {
        client.elements.activeKeys.add(key);
        
        /*switch (key) {
            case Movement.Up: client.player.position.velocity.y = -Characters[client.player.character].speed; break;
            case Movement.Right: client.player.position.velocity.x = Characters[client.player.character].speed; break;
            case Movement.Down: client.player.position.velocity.y = Characters[client.player.character].speed; break;
            case Movement.Left: client.player.position.velocity.x = -Characters[client.player.character].speed; break;
        }*/

        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    const key = KEYDOWN_MAP.get(event.which || event.keyCode);
    if (key) {
        client.elements.activeKeys.delete(key);
        event.preventDefault();
    }
});

document.addEventListener("mousemove", function (event) { 
    client.elements.mouse = {
        x: event.clientX,
        y: event.clientY
    };
});

client.elements.canvas.addEventListener("mousedown", function(event) {
    if (client.canvas.phase === Phases.Arena) client.player.attack.attacking.client = true;
    event.preventDefault();
});

client.elements.canvas.addEventListener("mouseup", function(event) {
    if (client.canvas.phase === Phases.Arena) client.player.attack.attacking.client = false;
    event.preventDefault();
});