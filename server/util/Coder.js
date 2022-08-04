// F32 -> Uint8 Standard
const base = new ArrayBuffer(4),
    u8 = new Uint8Array(base),
    f32 = new Float32Array(base);

const Writer = class {
    constructor(length = 4096) {
        this.at = 0;
        this.buffer = new Uint8Array(length);

        this.TextEncoder = new TextEncoder();
    }

    string(str) {
        const bytes = this.TextEncoder.encode(str);
        this.buffer.set(bytes, this.at);
        this.at += bytes.length;

        return this;
    }

    int(number) {
        this.buffer[this.at++] = number;
        
        return this;
    }

    float(number) {
        f32[0] = number;
        this.buffer.set(u8, this.at); 
        this.at += 4;

        return this;
    }

    out() {
        return this.buffer.subarray(0, this.at);
    }
}

const Reader = class {
    constructor(buffer) {
        this.at = 0;
        this.buffer = buffer;

        this.TextDecoder = new TextDecoder();
    }

    string() {
        const start = this.at;
        while (this.buffer[this.at]) this.at++;
        return this.TextDecoder.decode(this.buffer.subarray(start, this.at));
    }

    int() {
        return this.buffer[this.at++];
    }

    float() {
        u8.set(this.buffer.subarray(this.buffer.at, this.buffer.at += 4));
        return f32[0];
    }
}

module.exports = { Reader, Writer };