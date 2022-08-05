const Types = { Turd: 1, Pee: 2, Blood: 3 };
const States = { Destroyed: 8, NotDestroyed: 16 };
const Functions = {
    isDestroyed(byte) { return (byte & (States.Destroyed | States.NotDestroyed)) === States.Destroyed },
    type(byte, destroyed) { return byte ^ (destroyed ? States.Destroyed : States.NotDestroyed) },
}

module.exports = { Types, States, Functions };