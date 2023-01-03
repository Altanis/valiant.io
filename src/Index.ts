import GameServer from "./GameServer";
import http from "http";
import fs from "fs";

const httpServer = http.createServer((req, res) => {
    if (!req.url) return res.end("what");

    req.on("error", function(error) {
        console.error("Could not handle request:", error);
        res.statusCode = 500;
        res.end("500 Internal Server Error");
    });

    /** @ts-ignore */
    if (req.url === "/") req.url = "/index.html";
    try {
        const data = fs.readFileSync(`views/assets${req.url}`, "utf8");
        res.end(data);
    } catch (error) {
        try {
            const data = fs.readFileSync(`views/${req.url}`, "utf8");
            res.end(data);
        } catch (error) {
            res.statusCode = 404;
            res.end("404 Not Found");
        }
    }
});
httpServer.listen(8080, () => console.log("Server started on port 8080"));

/** START GAME SERVER */
const Server = new GameServer(httpServer);

/*httpServer.on("upgrade", (req, socket, head) => {
    console.log("handled many times.");
    Server.wss.handleUpgrade(req, socket, head, (ws) => {
        /** @ts-ignore 
        Server.emit("connection", ws, req);
    });
});*/

export { Server };