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

    random(min, max) {
        this.x = Math.floor(Math.random() * max) + min;        
        this.y = Math.floor(Math.random() * max) + min;

        return this;
    }
    
    clone() {
        return new Vector(this.x, this.y);
    }

    distance(vector) { // d = sqrt(∆x^2 + ∆y^2)
        return Math.sqrt(Math.pow(this.x - vector.x, 2), Math.pow(this.y - vector.y, 2));
    }

    get magnitude() { // m = sqrt(x^2 + y^2)
        return Math.hypot(this.x, this.y);
    }
}