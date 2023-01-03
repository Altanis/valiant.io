/** BUFFERS: Used to convert between different byte-lengths. */
const conversion = new ArrayBuffer(4);
const u8 = new Uint8Array(conversion);
const f32 = new Float32Array(conversion);

/** SwiftStream, an efficient binary protocol manager written by Altanis. */
export default class SwiftStream {
    /** The buffer SwiftStream is using. */
    public buffer = new Uint8Array(4096);
    /** The position at which the buffer is being read. */
    public at = 0;
    /** UTF8 Decoder. */
    public TextDecoder = new TextDecoder();
    /** UTF8 Encoder. */
    public TextEncoder = new TextEncoder();

    Set(buffer: Uint8Array) {
        this.buffer = buffer;
    }

    Clear() {
        this.buffer = new Uint8Array(4096);
        this.at = 0;
    }

    /** READER */
    ReadI8() {
        return this.buffer[this.at++];
    }

    ReadFloat32() {
        u8.set(this.buffer.slice(this.at, this.at += 4));
        return f32[0];
    }

    ReadUTF8String() {
        const start = this.at;
        while (this.buffer[this.at++]);
        return this.TextDecoder.decode(this.buffer.slice(start, this.at - 1));
    }

    /** WRITER */
    WriteI8(value: number) {
        this.buffer[this.at++] = value;
        return this;
    }

    WriteFloat32(value: number) {
        f32[0] = value;
        this.buffer.set(u8, this.at);
        this.at += 4;
        return this;
    }

    WriteCString(value: string) {
        this.buffer.set(this.TextEncoder.encode(value), this.at);
        this.at += value.length;
        this.buffer[this.at++] = 0;
        return this;
    }

    Write(): Uint8Array {
        const result = this.buffer.subarray(0, this.at);
        this.Clear();
        return result;
    }
}