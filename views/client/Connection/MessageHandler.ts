import Connection from "./Connection";
import SwiftStream from "./SwiftStream";
import UpdateParser from "./Helpers/UpdateParser";

/** A handler for all incoming messages. */
export default class MessageHandler {
    /** The connection which the handler is representing. */
    private connection: Connection;
    /** The update parser. */
    private UpdateParser: UpdateParser | null = null;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    // Woah, that's a big packet!
    public Update() {
        const SS = new SwiftStream();
        SS.Set(this.connection.SwiftStream.buffer);
        this.connection.SwiftStream.Clear();

        if (!this.UpdateParser) this.UpdateParser = new UpdateParser(this.connection);
        this.UpdateParser!.parse(SS);
    }
}