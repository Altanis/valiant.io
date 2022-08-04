const { Users, Ratelimits } = require('../db/Models');

/**
 * PROTOCOL
 * SERVERBOUND:
    * 
 * CLIENTBOUND:
    * 
 * ERRNO CODES
 * 
 * 1000 - Too Many Connections
 * 1001 - Cheater Detected
 * 1002 - Update Version
 * 1003 - Invalid Account
 * 1006 - Unknown Error
 */

module.exports = (player, message) => {
    try {
        message = message.toString();
        message = JSON.parse(string);

        if (!Object.hasOwn(message, 'header')) 
            return player.close(1001);
        switch (message.header) {
            // Think of this later.
        }
    } catch (error) {
        player.close(1001);
    }
}