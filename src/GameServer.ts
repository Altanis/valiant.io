import { Server } from 'ws';
import HTTP from "http";

import { MaximumConnections } from './Const/Config';
import { CloseEvent } from './Const/Enums';

import MessageHandler from './Managers/MessageHandler';
import SpatialHashGrid from './Managers/SpatialHashGrid';

import PlayerHandler from './Entities/PlayerHandler';
import Entity from './Entities/Entity';
import { Box } from './Entities/Objects';

export default class GameServer {
    /** The WebSocket server where clients connect to. */
    public wss: Server;
    /** The players in the game. */
    public players = new Set<PlayerHandler>();
    /** The list of banned players. */
    public banned: string[] = [];
    /** The handler for incoming messages. */
    public MessageHandler = new MessageHandler(this);
    /** The entities currently in game. */
    public entities: Entity[] = [];

    /** Arena information. */
    /** The length and width of the arena. */
    public arenaBounds = 14400;
    /** The hashgrid for the arena. */
    public SpatialHashGrid = new SpatialHashGrid();

    constructor(port: HTTP.Server | number = 8080) {
        this.wss = typeof port === "number" ? new Server({ port }) : new Server({ server: port });
        this.renderObjects();
        this.handle();

        setInterval(() => this.tick(), 1000 / 25);
    }

    /** Renders the ingame objects. */
    private renderObjects(): void {
        // render one box
        this.entities.push(new Box(this));
    }

    /** Sets up handlers for the WebSocket server. */
    private handle(): void {
        this.wss.on('listening', () => console.log("[WS]: Server is online. AddressInfo:", this.wss.address()));
        this.wss.on('error', er => console.error("[WS]: An error has occured.", er));
        this.wss.on('close', () => console.log("[WS]: Server closing prematurely."));
        this.wss.on('connection', (socket, request) => {
            console.log("[WS]: A new connection has been established.");
            if (this.players.size >= MaximumConnections) {
                request.destroy(new Error("Threshold for maximum amount of connections (per IP) has been exceeded."));
                return socket.close(CloseEvent.ServerFilled);
            }

            const manager = new PlayerHandler(this, request, socket);
            this.players.add(manager);
            this.entities[this.entities.length] = manager;
        });
    }

    /** Tick-loop which executes every frame (25 TPS). */
    public tick(): void {
        this.SpatialHashGrid.clear();
        
        this.entities.forEach(entity => this.SpatialHashGrid.insert(entity.position!.x, entity.position!.y, entity.dimensions[0], entity.dimensions[1], entity.id));
        this.entities.forEach(entity => entity.tick());   
    }
}