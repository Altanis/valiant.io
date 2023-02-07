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
                        player.noLerp = player.position.old.ts === 0;

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

        const oov = type !== 0x00 ? type : SwiftStream.ReadI8();
        if (oov === 0x01) {
            let entity: number;
            while ((entity = SwiftStream.ReadI8()) !== 0xFF) {
                player.surroundings = player.surroundings.splice(0, player.surroundings.findIndex(e => e.id === entity));
            }
        }

        const surroundings = type !== 0x00 ? type : (oov !== 0x01 ? oov : SwiftStream.ReadI8());
        if (surroundings === 0x02) {            
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

                                    break;
                                }
                                case Fields.Position: {
                                    const x = SwiftStream.ReadFloat32();
                                    const y = SwiftStream.ReadFloat32();

                                    box.noLerp = box.position.old.ts === 0;
                                
                                    box.position.old = box.position.new;
                                    box.position.new = { x, y, ts: Date.now() };

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
    }
}