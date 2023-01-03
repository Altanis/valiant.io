import { CloseEvent, Characters } from '../Const/Enums';

import PlayerHandler from './PlayerHandler';
import GameServer from '../GameServer';
import Vector from './Vector';
import { randInt } from '../Utils/Functions';

export default class MessageHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    
    constructor(server: GameServer) {
        this.server = server;
    }

    // [0, string(name), i8(characterIdx), i8(abilityIdx)]
    Spawn(player: PlayerHandler) {
        const name = player.SwiftStream.ReadUTF8String()?.trim();
        const characterIndex = player.SwiftStream.ReadI8();
        const abilityIndex = player.SwiftStream.ReadI8();

        console.log(name, characterIndex, abilityIndex);

        if (
            !name
            || name.length <= 0
            || name.length >= 16
            || player.alive

            || !Characters[characterIndex]
            || !Characters[characterIndex].abilities[abilityIndex]
        ) return player.close(CloseEvent.InvalidProtocol);

        player.name = name;
        player.character = Characters[characterIndex];
        player.abilityIndex = abilityIndex;

        player.velocity = new Vector(0, 0);
        player.position = new Vector(0, 0);
        //player.position = new Vector(randInt(0, this.server.arenaBounds), randInt(0, this.server.arenaBounds));

        player.alive = true;
        player.update.add("position");
        player.update.add("resolution");
    }
 };