import { CloseEvent, Characters } from '../Const/Enums';

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
        const character = player.SwiftStream.ReadI8();
        const abilityIndex = player.SwiftStream.ReadI8();

        if (
            !name
            || name.length <= 0
            || name.length >= 16
            || player.alive

            || !Characters[character]
            || !Characters[character].abilities[abilityIndex]
        ) return player.close(CloseEvent.InvalidProtocol);

        player.name = name;
        player.alive = true;
        player.character = Characters[character];
        player.abilityIndex = abilityIndex;
    }
 };