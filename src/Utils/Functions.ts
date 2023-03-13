/** Returns a random float in bounds of `min` and `max`. */
export const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;
/** Returns a random integer in bounds of `min` and `max`. */
export const randInt = (min: number, max: number) => randFloat(min, max) | 0;

/** Constrain a value between two values. */
export const constrain = (min: number, value: number, max: number) => Math.max(Math.min(value, max), min);

/** Gets the distance between two angles. */
export const angleDistance = (a: number, b: number) => {
    const p = Math.abs(b - a) % (Math.PI * 2);
    return (p > Math.PI ? (Math.PI * 2) - p : p);
}