import { Fields, Entities, Phases } from "../Const/Enums";
import Connection from "./Connection";

/** A handler for all incoming messages. */
export default class MessageHandler {
    /** The connection which the handler is representing. */
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    // Woah, that's a big packet!
    public Update() {
        const SwiftStream = this.connection.SwiftStream;
        const player = this.connection.client.player;

        const type = SwiftStream.ReadI8();
        if (type === 0x00) { // update player
            let len = SwiftStream.ReadI8();

            for (;len--;) {
                const field = SwiftStream.ReadI8();
                switch (field) {
                    case Fields.ID: {
                        const id = SwiftStream.ReadI8();
                        player.id = id;
                        player.alive = true;
                        
                        this.connection.client.elements.homescreen.homescreen.style.display = "none";

                        this.connection.client.canvas.phase = Phases.Arena;
                        this.connection.client.elements.arena.stats.style.display = "block";
                        this.connection.client.elements.arena.utils.style.display = "block";
                        this.connection.client.canvas.mapCanvas.style.display = "block";

                        break;
                    }
                    case Fields.Position: {
                        const x = SwiftStream.ReadFloat32();
                        const y = SwiftStream.ReadFloat32();
                        
                        console.log(x, y);

                        player.position.old = player.position.new;
                        player.position.new = { x, y, ts: Date.now() };

                        break;
                    }
                    case Fields.Attacking: {
                        player.attack.attacking.change = SwiftStream.ReadI8() === 0x01;
                        if (!player.attack.attacking.server && player.attack.attacking.change)
                            player.attack.attacking.server = true;

                        break;
                    };
                    case Fields.Weapons: {
                        const weapon = SwiftStream.ReadI8();
                        player.weapon = weapon;
                        break;
                    }
                    case Fields.FOV: {
                        const fov = SwiftStream.ReadFloat32();
                        console.log("found FOV", fov);
                        player.fov = fov;
                        break;
                    }
                }
            }
        }

        const surroundings = type === 0x00 ? SwiftStream.ReadI8() : type;
        if (surroundings === 0x01) {
            let len = SwiftStream.ReadI8();
            for (;len--;) {
                const entity = SwiftStream.ReadI8();
                switch (entity) {
                    case Entities.Box: {
                        const x = SwiftStream.ReadFloat32();
                        const y = SwiftStream.ReadFloat32();

                        // TODO(Altanis): Fix fov.
                        console.log("Found a box at", x, y);
                        break;
                    }
                }
            }
        }
    }
}