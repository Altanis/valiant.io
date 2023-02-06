/** Returns a random integer in bounds of `min` and `max`. */
export function randFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number): number {
    return randFloat(min, max) | 0;
}