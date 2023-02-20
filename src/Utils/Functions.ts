/** Returns a random integer in bounds of `min` and `max`. */
export function randFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number): number {
    return randFloat(min, max) | 0;
}

/** Constrain a value between two values. */
export const constrain = (min: number, value: number, max: number) => Math.max(Math.min(value, max), min);