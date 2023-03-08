import readline from "node:readline";
import { inspect } from "node:util";

import GameServer from "./GameServer";

/** Remotely evaluates commands and raw JavaScript from terminal. */
export class RemoteEval {
    private instance = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    public server: GameServer;

    constructor(server: GameServer) {
        this.server = server;
        this.server.logger.info("EVAL", "Enabled remote evaluation.");
        this.instance.on("line", line => {
            this.parse(line);
        });
    }

    parse(line: string) {
        if (!line.startsWith("/")) return; // Invalid command.

        const args = line.split(" "),
            command = args.shift()?.toLowerCase();
        
        switch (command) {
            case "/eval": {
                let code = args.join(" ");
                try {
                    code = inspect(eval(code));
                    this.server.logger.info("EVAL", code);
                } catch (e) {
                    this.server.logger.error("EVAL", "Could not evaluate code: " + e);
                }
            }
        }
    }
}