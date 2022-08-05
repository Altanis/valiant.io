module.exports = {
    CLIENTBOUND: {
        ACCEPT: 0, // [0]
        PING: 1, // [1]
        MAGIC: 2, // [2, turd]
    },
    SERVERBOUND: {
        INIT: 0, // [0, string(id)]
        PING: 1, // [1]
        SPAWN: 2,
    }
}