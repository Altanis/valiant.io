import Connection from "./Connection/Connection";

import Logger from "./Utils/Logger";

import ElementManager from "./Rendering/ElementManager";
import CanvasManager from "./Rendering/CanvasManager";
import Player from "./Entity/Player";

/** A representation of the client currently on the site. */
export default class Client {
    /** The logging system in the IOStream. */
    public logger = Logger;
    /** The player information of the client. */
    public player = new Player();
    /** The connection between the client and the server. */
    public connection = new Connection(this, "ws://localhost:8080");
    /** The DOM element manager. */
    public elements = new ElementManager(this);
    /** The canvas on which the client draws on. */
    public canvas = new CanvasManager();
};