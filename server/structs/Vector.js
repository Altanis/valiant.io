module.exports = class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    distance(vector) { // d = sqrt(∆x^2 + ∆y^2)
        return Math.sqrt(Math.pow(this.x - vector.x, 2), Math.pow(this.y - vector.y, 2));
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    get magnitude() { // m = sqrt(x^2 + y^2)
        return Math.hypot(this.x, this.y);
    }
}