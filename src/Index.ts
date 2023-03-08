import GameServer from "./GameServer";
import http from "http";
import fs from "fs";
import { RemoteEval } from "./RemoteEval";

const httpServer = http.createServer((req, res) => {
    if (!req.url) return res.end("what");

    req.on("error", function(error) {
        console.error("Could not handle request:", error);
        res.statusCode = 500;
        res.end("500 Internal Server Error");
    });

    /** @ts-ignore */
    if (req.url === "/") req.url = "/index.html";

    /*switch (req.url.split(".").pop()) {
        case "js": return res.setHeader("Content-Type", "text/javascript");
        case "css": return res.setHeader("Content-Type", "text/css");
        case "html": return res.setHeader("Content-Type", "text/html");
        case "png": return res.setHeader("Content-Type", "text/img+png");
        case "jpg": return res.setHeader("Content-Type", "text/img+jpg");
        case "jpeg": return res.setHeader("Content-Type", "text/img+jpeg");
        case "gif": return res.setHeader("Content-Type", "text/img+gif");
        case "svg": return res.setHeader("Content-Type", "text/img+svg");
    }*/

    try {
        const data = fs.readFileSync(`views/assets${req.url}`);
        res.end(data);
    } catch (error) {
        try {
            const data = fs.readFileSync(`views${req.url}`);
            res.end(data);
        } catch (error) {
            res.statusCode = 404;
            res.end(http.STATUS_CODES[404]);
        }
    }
});
httpServer.listen(8080, () => console.log("Server started on port 8080"));

const Server = new GameServer(httpServer);
const r = new RemoteEval(Server);

export { Server, r };