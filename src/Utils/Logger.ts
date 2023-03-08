export default class Logger {
    log = console.log;

    public info(header: string, ...args: string[]) {
        console.log(`[\x1b[36mLOG: ${header}\x1b[0m]`, ...args);
    }

    public warn(header: string, ...args: string[]) {
        console.warn(`[\x1b[33mWARN: ${header}\x1b[0m]`, ...args);
    }

    public error(header: string, ...args: string[]) {
        console.error(`[\x1b[31mERROR: ${header}\x1b[0m]`, ...args);
    }

    public trace(header: string, ...args: string[]) {
        console.trace(`[\x1b[32mTRACE: ${header}\x1b[0m]`, ...args);
    }

    public success(header: string, ...args: string[]) {
        console.log(`[\x1b[32mSUCCESS: ${header}\x1b[0m]`, ...args);
    }
};