import SwiftStream from "./SwiftStream";
import Client from '../Client';

import { CloseEvents, ClientBound, ServerBound } from "../Const/Enums";
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
        this.SwiftStream.WriteI8(header);

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
                this.socket.send(this.SwiftStream.WriteI8(data.movement).Write());
                break;
            }
            case ServerBound.Angle: {
                this.socket.send(this.SwiftStream.WriteI8(this.client.player.angle).Write());
                break;
            }
            case ServerBound.Attack: {
                this.socket.send(this.SwiftStream.WriteI8(data.isAtk).Write());
                break;
            }
            default: {
                this.SwiftStream.Write();
                throw new Error("Could not find header.");
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
            console.log(CloseEvents[event.code] || CloseEvents.Unknown);
        });

        this.socket.addEventListener("message", ({ data }) => {         
            this.SwiftStream.Set(data = new Uint8Array(data));
            this.parse();   
        });
    }

    private parse() {
        const SwiftStream = this.SwiftStream;
        const header = SwiftStream.ReadI8();

        switch (header) {
            case ClientBound.Update: return this.MessageHandler.Update();
        }

        this.SwiftStream.Clear();
    }
}