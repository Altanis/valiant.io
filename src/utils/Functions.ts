/** Returns a random integer in bounds `min` and `max`. */
export function randInt(min: number, max: number): number {
    return (Math.floor(Math.random() * (max - min + 1)) + min) | 0;
}