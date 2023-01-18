import SwiftStream from "./SwiftStream";
import Client from '../Client';

import { CloseEvents } from "../Const/Enums";

/** A representation of the WebSocket connection between the client and the server. */
export default class Connection extends EventTarget {
    /** The raw socket between the client and server. */
    public socket: WebSocket;
    /** The client which the connection is representing. */
    public client: Client;
    /** The amount of retries attempted. */
    private retries = 0;

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

        // handle messages later
    }
}