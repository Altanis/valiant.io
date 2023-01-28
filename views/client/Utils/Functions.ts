/** TAU, 360 degrees or Math.PI * 2. */
export const TAU = Math.PI * 2;

/** Returns a random number in between two numbers. */
export const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;

/** Linear interpolation for any type of integer. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Linear interpolation for specifically angles. */
export const lerpAngle = (a: number, b: number, t: number) => a + -((a - b + Math.PI * 3) % (TAU) - Math.PI) * t;