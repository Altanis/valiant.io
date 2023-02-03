/** A colorful logger to highlight important actions. */
const Logger = {
    log: (...args: any[]) => console.log(`%c[${Date().split(" ")[4]}]: ${args.join(" ")}`, 'color: blue;'),
    err: (...args: any[]) => console.log(`%c[${Date().split(" ")[4]}]: ${args.join(" ")}`, 'color: red;'),
    success: (...args: any[]) => console.log(`%c[${Date().split(" ")[4]}]: ${args.join(" ")}`, 'color: green;'),
    warn: (...args: any[]) => console.log(`%c[${Date().split(" ")[4]}]: ${args.join(" ")}`, 'color: yellow;'),
    debug: (...args: any[]) => console.log(args.join(" "))
};

export default Logger;