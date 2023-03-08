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
    public add(vector: Vector, strict = false): Vector {
        if (strict) {
            let x = this.x + vector.x;
            let y = this.y + vector.y;

            if (x > 14400) this.x = 14400;
            else if (x < 0) this.x = 0;
            else this.x = x;

            if (y > 14400) this.y = 14400;
            else if (y < 0) this.y = 0;
            else this.y = y;

            return this;
        }

        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    /** Subtracts by a vector. */
    public subtract(vector: Vector, strict = false): Vector {
        if (strict) {
            let x = this.x - vector.x;
            let y = this.y - vector.y;

            if (x > 14400) this.x = 14400;
            else if (x < 0) this.x = 0;
            else this.x = x;

            if (y > 14400) this.y = 14400;
            else if (y < 0) this.y = 0;
            else this.y = y;

            return this;
        }
        
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    /** Scales (multiplies) by a vector. */
    public scale(scalar: number): Vector {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    /** Gets the magnitude (length) of the vector. */
    public get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Sets the magnitude (length) of the vector. */
    public set magnitude(magnitude: number) {
        /** Normalizes vector then multiply by new magnitude. */
        this.x = Math.cos(this.angle()) * magnitude;
        this.y = Math.sin(this.angle()) * magnitude;
    }

    /** Normalizes the vector (transforms it to a unit vector). */
    public normalize(): Vector {
        const magnitude = this.magnitude;
        this.x /= magnitude || 1; 
        this.y /= magnitude || 1;

        return this;
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
    public angle(reference?: Vector): number {
        return Math.atan2(this.y - (reference?.y || 0), this.x - (reference?.x || 0));
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

    /** Creates a new vector with a specific distance away from the current vector. */
    public moveByAngle(distance: number, angle: number): Vector {
        return new Vector(this.x + distance * Math.cos(angle), this.y + distance * Math.sin(angle));
    }

    /** Checks for equality between two vectors. */
    public equals(vector: Vector): boolean {
        return this.x === vector.x && this.y === vector.y;
    }
}