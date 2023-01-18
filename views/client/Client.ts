import Connection from "./Connection/Connection";

import Logger from "./Utils/Logger";

import ElementManager from "./Rendering/ElementManager";
import CanvasManager from "./Rendering/CanvasManager";

/** A representation of the client currently on the site. */
export default class Client {
    /** The logging system in the IOStream. */
    public logger = Logger;
    /** The connection between the client and the server. */
    public connection = new Connection(this, "ws://localhost:8080");
    /** The canvas on which the client draws on. */
    public canvas = new CanvasManager();
    /** The DOM element manager. */
    public elements = new ElementManager();
};