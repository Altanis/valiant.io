import { CloseEvent, Characters, Movement } from '../Const/Enums';

import PlayerHandler from '../Entities/PlayerHandler';
import GameServer from '../GameServer';
import Vector from '../Utils/Vector';
import { randInt } from '../Utils/Functions';
import { Sword } from '../Const/Game/Weapons';

export default class MessageHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    
    constructor(server: GameServer) {
        this.server = server;
    }

    // [0, string(name), i8(characterIdx), i8(abilityIdx)]
    Spawn(player: PlayerHandler): void {
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
        player.weapon = Sword;

        player.health = player.character.stats.health;
        player.armor = player.character.stats.armor;
        player.energy = player.character.stats.energy;

        player.velocity = new Vector(0, 0);
        player.position = new Vector(0, 0); //new Vector(randInt(0, this.server.arenaBounds), randInt(0, this.server.arenaBounds));

        player.alive = true;
        
        player.update.add("position");
        player.update.add("weapon");
        player.update.add("fov");
    }

    // [1, ...i8(Movement)]
    Move(player: PlayerHandler): void {
        if (
            !player.alive
            || !player.velocity
        ) return player.close(CloseEvent.InvalidProtocol);
        
        const movementKeys = [];
        while (player.SwiftStream.at < player.SwiftStream.buffer.length && movementKeys.length < 4)
            movementKeys.push(player.SwiftStream.ReadI8());
        
        for (const movement of movementKeys) {
            switch (movement) {
                case Movement.Up: player.velocity!.y = -player.character!.speed; break;
                case Movement.Right: player.velocity!.x = player.character!.speed; break;
                case Movement.Down: player.velocity!.y = player.character!.speed; break;
                case Movement.Left: player.velocity!.x = -player.character!.speed; break;
                default: return player.close(CloseEvent.InvalidProtocol);
            }
        }

        player.update.add("position");
    }

    // [2, i8(angle)]
    Angle(player: PlayerHandler): void {
        const angle = player.SwiftStream.ReadFloat32(); // measured in radians
        if (
            !player.alive
            || isNaN(angle)
            || angle > 3.15
            || angle < -3.15
        ) return player.close(CloseEvent.InvalidProtocol);

        player.angle = (angle < 0 && angle >= -3.15) ? angle + Math.PI * 2 : angle;
    }

    // [3, i8(isAtk)]
    Attack(player: PlayerHandler): void {
        if (!player.alive || !player.weapon) return player.close(CloseEvent.InvalidProtocol);
        const isAtk = player.SwiftStream.ReadI8() === 0x01;

        player.attacking = isAtk;
        player.update.add("attacking");
    }




    // Time to have a little bit  of fun.. :)
    Cheat(player: PlayerHandler): void {
        // [Format #1] Teleportation: [0xFF, f32(x), f32(y)]
        const x = player.SwiftStream.ReadFloat32();
        const y = player.SwiftStream.ReadFloat32();

        player.position!.x = x;
        player.position!.y = y;

        player.update.add("position");
    }
 };