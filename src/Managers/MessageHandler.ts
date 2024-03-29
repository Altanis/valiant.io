import { CloseEvent, Characters, Movement } from '../Const/Enums';

import PlayerHandler from '../Entities/PlayerHandler';
import GameServer from '../GameServer';
import Vector from '../Utils/Vector';
import { randFloat } from '../Utils/Functions';
import { Sword } from '../Const/Game/Weapons';

export default class MessageHandler {
    /** The manager of the WebSocket Server. */
    public server: GameServer;
    
    constructor(server: GameServer) {
        this.server = server;
    }

    // [0, string(name), i8(characterIdx), i8(abilityIdx)]
    Spawn(player: PlayerHandler): void {
        const name = player.SwiftStream.ReadCString()?.trim();
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
        player.position = new Vector(0, 0); //new Vector(randFloat(0, this.server.arenaBounds), randFloat(0, this.server.arenaBounds));

        player.alive = true;
        
        player.update.add("position");
        player.update.add("weapon");
        player.update.add("fov");
        player.update.add("alive");
        player.update.add("name");

        /** Send initial ping packet. */
        player.socket.send(new Uint8Array(0));
    }

    // [1, ...i8(Movement)]
    Move(player: PlayerHandler): void {
        if (
            !player.alive
            || !player.velocity
        ) return;
        
        const movementKeys = [];
        while (player.SwiftStream.at < player.SwiftStream.buffer.length && movementKeys.length < 4)
            movementKeys.push(player.SwiftStream.ReadI8());
        
        const velocity = new Vector(0, 0);
        
        for (const movement of movementKeys) {
            switch (movement) {
                case Movement.Up: velocity!.y -= player.character!.speed; break;
                case Movement.Right: velocity!.x += player.character!.speed; break;
                case Movement.Down: velocity!.y += player.character!.speed; break;
                case Movement.Left: velocity!.x -= player.character!.speed; break;
                default: return player.close(CloseEvent.InvalidProtocol);
            }
        }

        /** Ensure diagonal velocity is consistent (mag = 1). */
        if (velocity.magnitude && player.character) {
            velocity!.scale(player.character!.speed / velocity.magnitude);
        }

        player.velocity.add(velocity);
    }

    // [2, i8(angle)]
    Angle(player: PlayerHandler): void {
        const angle = player.SwiftStream.ReadFloat32(); // measured in radians
        if (
            isNaN(angle)
        ) return player.close(CloseEvent.InvalidProtocol);
        if (!player.alive || angle < -3.15 || angle > 3.15) return;

        player.angle = angle;
        player.update.add("angle");
    }

    // [3, i8(isAtk)]
    Attack(player: PlayerHandler): void {
        if (!player.alive || !player.weapon) return;
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