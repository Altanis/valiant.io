import { CloseEvent, Characters, Movement } from '../Const/Enums';

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
        player.position = new Vector(randInt(0, this.server.arenaBounds), randInt(0, this.server.arenaBounds));

        player.alive = true;
        player.update.add("position");
    }

    // [1, i8(Movement)]
    Move(player: PlayerHandler): void {
        if (
            !player.alive
            || !player.velocity
        ) return player.close(CloseEvent.InvalidProtocol);
        const movement = player.SwiftStream.ReadI8();
        if (!movement) return player.close(CloseEvent.InvalidProtocol);

        switch (movement) {
            case Movement.Up: player.velocity!.y = -5.323; break;
            case Movement.Right: player.velocity!.x = 5.323; break;
            case Movement.Down: player.velocity!.y = 5.323; break;
            case Movement.Left: player.velocity!.x = -5.323; break;
            default: return player.close(CloseEvent.InvalidProtocol);
        }

        player.update.add("position");
    }
 };