const { Users, Ratelimits } = require('../db/Models');
const { Reader, Writer } = require('../util/Coder');
const { SERVERBOUND, CLIENTBOUND } = require('../util/Payloads');

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
        * Field 0 (ARENA): [2, 0, ...entities[i8(type), u32(posx), u32(posy), u32(height), u32(width)]]
            * DEV_NOTE: When specializizng different entity types, remove height and width for turds. Client will auto assume 1x1. 
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

    const users = await Users.find(), ratelimits = await Ratelimits.find();

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
                player.pinged = true;
                return player.send(writer.i8(CLIENTBOUND.PING).out());
            }
            case SERVERBOUND.SPAWN: {
                const name = reader.string();

                player.alive = true;
                player.name = name || '';
                return player.position.random(0, player.game.mapSize);
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