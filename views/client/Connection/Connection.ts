import SwiftStream from "./SwiftStream";
import Client from '../Client';

import { CloseEvents, ClientBound, ServerBound, Phases } from "../Const/Enums";
import MessageHandler from "./MessageHandler";

/** A representation of the WebSocket connection between the client and the server. */
export default class Connection extends EventTarget {
    /** The raw socket between the client and server. */
    public socket: WebSocket;
    /** The client which the connection is representing. */
    public client: Client;
    /** The amount of retries attempted. */
    private retries = 0;

    /** The binary encoder/decoder for the connection. */
    public SwiftStream = new SwiftStream();
    /** The handler for incoming messages. */
    public MessageHandler = new MessageHandler(this);

    /** The latency of the player. */
    public latency = 0;
    /** The timestamp the last ping packet was received. */
    private lastPing = 0;

    constructor(client: Client, url: string) {
        super();
        
        this.client = client;

        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";

        this.handle();
    }

    public migrate(url: string) {
        if (++this.retries > 3) return this.client.logger.err("[WS]: Threshold for retries has been exceeded. Please reload.");

        this.socket.close(4999);
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";

        this.handle();
    }

    public send(header: number, data: { [key: string]: any }) {
        if (
            this.socket.readyState !== WebSocket.OPEN
            || (!this.client.player.alive && header !== ServerBound.Spawn)
        ) return;
        
        this.SwiftStream.WriteI8(header);
        console.log(this.SwiftStream.buffer.subarray(0, this.SwiftStream.at));

        switch (header) {
            case ServerBound.Spawn: {
                this.socket.send(
                    this.SwiftStream
                        .WriteCString(data.name)
                        .WriteI8(this.client.player.character)
                        .WriteI8(this.client.player.ability)
                        .Write()
                );
                
                break;
            }
            case ServerBound.Movement: {
                data.keys.forEach((key: number) => this.SwiftStream.WriteI8(key));
                this.socket.send(this.SwiftStream.Write());
                break;
            }
            case ServerBound.Angle: {
                this.socket.send(this.SwiftStream.WriteFloat32(data.measure).Write());
                break;
            }
            case ServerBound.Attack: {
                this.socket.send(this.SwiftStream.WriteI8(data.isAtk).Write());
                break;
            }
            default: {
                this.SwiftStream.Write();
                throw new Error("Could not find header. " + header);
            }
        }
    }

    private handle() {
        this.socket.addEventListener("open", () => {
            this.client.logger.success("[WS]: Connected to server.");
        });

        this.socket.addEventListener("error", () => {
            this.client.logger.err("[WS]: Connection to server has failed.");
            this.migrate(this.socket.url);
        });

        this.socket.addEventListener("close", event => {
            if (event.code === 4999) return; // Internal migration code.
            this.client.elements.homescreen.homescreen.style.display =
                this.client.elements.arena.game.style.display = "none";
            
            this.client.canvas.phase = Phases.Homescreen;
            this.client.elements.disconnect.disconnect.style.display = "block";
            this.client.logger.err(
                /** @ts-ignore */
                this.client.elements.disconnect.disconnectMessage.innerText = CloseEvents[event.code] || CloseEvents[3006]
            );
        });

        this.socket.addEventListener("message", ({ data }) => {     
            if (data.byteLength === 0) { // Ping packet.
                const old = this.lastPing;
                this.lastPing = Date.now();
                this.latency = this.lastPing - old;

                this.client.elements.arena.ping.innerText = `${this.latency}ms localhost`;

                return this.socket.send(new Uint8Array(0));
            }

            console.log(new Uint8Array(data));
            this.SwiftStream.Set(data = new Uint8Array(data));
            this.parse();   
        });
    }

    private parse() {
        const SwiftStream = this.SwiftStream;
        const header = SwiftStream.ReadI8();

        switch (header) {
            case ClientBound.Update: this.MessageHandler.Update(); break;
            default: {
                this.SwiftStream.Clear();
                throw new Error("Could not parse packet. " + header);
            }
        }

        this.SwiftStream.Clear();
    }
}