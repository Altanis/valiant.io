import moment from 'moment';

export default class Logger {
    log = console.log;

    public info(...args: string[]) {
        console.log("[\x1b[36mINFO\x1b[0m]", ...args);
    }

    public warn(...args: string[]) {
        console.warn("[\x1b[33mWARN\x1b[0m]", ...args);
    }

    public error(...args: string[]) {
        console.error("[\x1b[31mERR\x1b[0m]", ...args);
    }

    public trace(...args: string[]) {
        console.trace("[\x1b[32mTRACE\x1b[0m]", ...args);
    }

    public success(...args: string[]) {
        console.log("[\x1b[32mSUCCESS\x1b[0m]", ...args);
    }
};