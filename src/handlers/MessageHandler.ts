import { CloseEvent } from '../typings/Enums';

import PlayerHandler from './PlayerHandler';
import GameServer from '../GameServer';

export default class MessageHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    
    constructor(server: GameServer) {
        this.server = server;
    }

    // [0, string(name)]
    Spawn(player: PlayerHandler) {
        const name = player.SwiftStream.ReadUTF8String()?.trim();
        if (
            !name
            || name.length <= 0
            || name.length >= 16
            || player.alive
        ) return player.close(CloseEvent.InvalidProtocol);


        player.name = name;
        player.alive = true;
    }
 };