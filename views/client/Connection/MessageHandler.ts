import { Fields, Entities, Phases } from "../Const/Enums";
import Connection from "./Connection";

import Box from "../Entity/Box";

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

        // TOOD(Altanis): Split this into multiple files.

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
                        
                        player.noLerp = player.position.current.ts === 0;

                        // TODO: Make this less weird.
                        player.position.current.ts = player.position.target.ts;
                        player.position.target = { x, y, ts: Date.now() };

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
                        player.fov = fov;
                        break;
                    }
                }
            }
        }

        const surroundings = type !== 0x00 ? type : SwiftStream.ReadI8();
        if (surroundings === 0x01) {            
            let len = SwiftStream.ReadI8();
            for (;len--;) {
                const entity = SwiftStream.ReadI8();
                let fieldLen = SwiftStream.ReadI8();

                switch (entity) {
                    case Entities.Box: {
                        let box: Box = new Box();

                        for (; fieldLen--;) {
                            const field = SwiftStream.ReadI8();
                            switch (field) {
                                case Fields.ID: {                                    
                                    const id = SwiftStream.ReadI8();
                                    let _box = player.surroundings.find(entity => entity.id === id);
                                    if (!_box) {
                                        box.id = id;
                                        player.surroundings.push(box);
                                    } else {
                                        box = _box;
                                    }

                                    box.updated = true;
                                    break;
                                }
                                case Fields.Position: {
                                    const x = SwiftStream.ReadFloat32();
                                    const y = SwiftStream.ReadFloat32();

                                    box.noLerp = box.position.current.ts === 0;
                                    box.position.current.ts = box.position.target.ts;
                                    box.position.target = { x, y, ts: Date.now() };

                                    break;
                                }
                                case Fields.Dimensions: {
                                    const width = SwiftStream.ReadFloat32();
                                    const height = SwiftStream.ReadFloat32();

                                    box.dimensions = { width, height };
                                    break;
                                }
                            }
                        }

                        break;
                    }
                }
            }
        }

        // Remove all entities that haven't been updated.
        let i = player.surroundings.length;
        player.surroundings = player.surroundings.filter(entity => entity.updated);
        if (i !== player.surroundings.length) alert("deletion!");
        player.surroundings.forEach(entity => entity.updated = false);
    }
}