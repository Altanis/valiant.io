import Client from "./Client";
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

client.elements.canvas.addEventListener('contextmenu', event => event.preventDefault());
