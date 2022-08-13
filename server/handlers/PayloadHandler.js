const { Users, Ratelimits } = require('../db/Models');
const { Reader, Writer } = require('../util/Coder');
const { SERVERBOUND, CLIENTBOUND } = require('../util/Payloads');
const Types = require('../util/TurdType');

/**
 * PROTOCOL
 * SERVERBOUND:
    * INIT: [0, string(user_id)]
    * PING: [1]
    * SPAWN: [2, string(name)]
 * CLIENTBOUND:
    * ACCEPT: [0]
    * PING: [1]
    * MAGIC: (very complicated)
        * Field 0 (ARENA): [2, 0, ...entities[i8(type), u32(posx), u32(posy), u32?(width), u32?(height)]]
            * DEV_NOTE: When specializizng different entity types, remove height and width for turds. Client will auto assume 1x1. 
        * Field 1 (PLAYERS): [2, 1, ...players[i8(color), u32(posx), u32(posy), u32(width), u32(height)]]
            * DEV_NOTE: First element of Players[] is the client's player. 
* ERRNO CODES
 * 
 * 1000 - Too Many Connections
 * 1001 - Cheater Detected
 * 1002 - Update Version
 * 1003 - Invalid Account
 * 1006 - Unknown Error
 */

module.exports = async (player, message) => {
    message = new Int8Array(message);

    const reader = new Reader(message);
    const writer = new Writer();

    const users = await Users.find();

    try {
        const header = reader.i8();

        switch (header) {
            case SERVERBOUND.INIT: {
                const id = reader.string();
                const user = users.filter(user => user.id === id);

                if (!user) return player.close(1003);
                player.account = user;

                return player.send(writer.i8(CLIENTBOUND.ACCEPT).out());
            }
            case SERVERBOUND.PING: {
                return player.pinged = true;
            }
            case SERVERBOUND.SPAWN: {
                const name = reader.string();

                player.alive = true;
                player.name = name || '';
                player.position.random(0, player.game.mapSize)

                const range = Math.floor(player.points / 1000) + 5;
                const update = new Writer().i8(2);

                update.i8(0); // arena field    
                for (let rangedX = range + 1; rangedX--;) {
                    for (let rangedY = range + 1; rangedY--;) {
                        const x = player.position.x - rangedX, y = player.position.y - rangedY;
                        const [type, respawnAt] = player.game.turd[x][y];
                        
                        update.i8(type).u32(x).u32(y);
                    }
                }
                update.i8(-1);

                update.i8(1) // player field
                    .i8(player.color)
                    .u32(player.points)
                    .u32(player.position.x)
                    .u32(player.position.y)
                    .u32(player.size.width)
                    .u32(player.size.height)
                    .u32(range)
                .i8(-1);

                return player.send(update.out());
            }
            default: {
                return player.close(1001);
            }
        }
    } catch (error) {
        console.error(error);
        player.close(1001);
    }
}