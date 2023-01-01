/** A representation of both direction and magnitude on a 2D plane. */
export default class Vector {
    /** The x-coordinate of the vector. */
    public x: number;
    /** The y-coordinate of the vector. */
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /** Adds by a vector. */
    public add(vector: Vector): Vector {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /** Subtracts by a vector. */
    public subtract(vector: Vector): Vector {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    /** Scales (multiplies) by a vector. */
    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /** Gets the magnitude (length) of the vector. */
    public get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Gets the normalized vector. */
    public get normalize(): Vector {
        return this.clone().scale(1 / this.magnitude);
    }

    /** Gets the dot product of the vector. */
    public dot(vector: Vector): number {
        return this.x * vector.x + this.y * vector.y;
    }

    /** Gets the cross product of the vector. */
    public cross(vector: Vector): number {
        return this.x * vector.y - this.y * vector.x;
    }

    /** Gets the angle of the vector. */
    public get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    /** Gets the distance between two vectors. */
    public distance(vector: Vector): number {
        return this.subtract(vector).magnitude;
    }

    /** Gets the angle between two vectors. */
    public angleBetween(vector: Vector): number {
        return Math.acos(this.dot(vector) / (this.magnitude * vector.magnitude));
    }

    /** Clones the vector. */
    public clone(): Vector {
        return new Vector(this.x, this.y);
    }
}