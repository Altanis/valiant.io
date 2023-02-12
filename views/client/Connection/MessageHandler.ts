import Connection from "./Connection";
import UpdateParser from "./Helpers/UpdateParser";

/** A handler for all incoming messages. */
export default class MessageHandler {
    /** The connection which the handler is representing. */
    private connection: Connection;
    /** The update parser. */
    private parser: UpdateParser;

    constructor(connection: Connection) {
        this.connection = connection;
        this.parser = new UpdateParser(connection);
    }

    /** This must be such a tiny packet, it only needs one line to parse! */
    public Update() {
        this.parser.parse();
    }
}