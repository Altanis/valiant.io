// ADD IIFE LATER
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

const canvas = window.canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Mouse position is { x: event.clientX * dpr, y: event.clientY * dpr };
let width = 0, height = 0, dpr = 0, lastLoop = 0, fps = [], avgFPS = 0;
function resize() {
    if (width !== window.innerWidth || height !== innerHeight || dpr !== window.devicePixelRatio) {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
    }
}
window.addEventListener('resize', resize);
resize();

let currentScreen = 0; // 0 = MENU, 1 = PLAYING, 2 = DEATH

function limit_input(n) { // https://stackoverflow.com/questions/16949716/limit-html-text-input-to-a-particular-number-of-bytes/73009718#73009718
    return function(e) {
        const is_clipboard = e instanceof ClipboardEvent;
        if (is_clipboard && e.type != "paste") {
            return;
        }
        let new_val = e.target.value;
        if (is_clipboard) {
            new_val += e.clipboardData.getData("text");
        } else {
            new_val += e.key;
        }

        if (new TextEncoder().encode(new_val).byteLength -
        e.target.selectionEnd + e.target.selectionStart > n) {
            if (e.target.value == "" && is_clipboard) {
                const old = e.target.placeholder;
                e.target.placeholder = "Text too long to paste!";
                setTimeout(function() {
                    e.target.placeholder = old;
                }, 1000);
            }
            e.preventDefault();
        }
    };
}

if (!localStorage.id) {
    fetch('http://localhost:3000/account/register', { method: 'POST' })
        .then(r => r.json())
        .then(response => {
            if (response.status === 'ERROR') { alert('Error when creating Account: ' + response.data.message + `: ${response.data.dev_error || ''}`); delete localStorage.id; }
            else if (response.status === 'SUCCESS') {
                localStorage.id = response.data.id;
            }

            window.location.reload();
        });
}

const socket = new WebSocket('ws://localhost:3000');
socket.binaryType = 'arraybuffer';

socket.addEventListener('open', () => {
    console.log('[WEBSOCKET]: Socket opened.');
    socket.send(new Writer().int(0).string(localStorage.id).out());
});
socket.addEventListener('error', console.error);
socket.addEventListener('close', ({ code }) => {
    switch (code) {
        // Deal with these later.
    }
});

socket.addEventListener('message', ({ data }) => {
    data = new Uint8Array(data);
    const reader = new Reader(data);

    switch (reader.int()) {
        case 0: { return console.log('Logged in.'); }
        case 1: { return socket.send(new Writer().int(1).out()); }
    }
});

document.getElementById('loading').style.display = 'none';
document.getElementById('textInput').style.display = 'block';
document.getElementById('textInput').onkeypress = document.getElementById('textInput').onpaste = limit_input(15);

const CanvasEditor = {
    linedText: (text, x, y, stroke = true) => { stroke && context.strokeText(text, x, y); context.fillText(text, x, y) },
}

function menu() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (fps.length > 10) fps.shift();

    let now = performance.now();
    fps.push(Math.round(1000 / (now - lastLoop)));
    avgFPS = (fps.reduce((a, b) => a + b) / fps.length).toFixed(1);
    lastLoop = now;

    context.fillStyle = '#FFFFFF';
    context.lineWidth = canvas.height / 250;
    context.font = `${canvas.height / 100}px Ubuntu`;

    CanvasEditor.linedText(`${avgFPS} FPS`, canvas.height / 40, canvas.height / 60);

    switch (currentScreen) {
        case 0: { // MENU
            context.fillStyle = '#FFFFFF';
            context.strokeStyle = '#000000';
            context.lineWidth = canvas.height / 50;
            context.textAlign = 'center';
            context.textBaseLine = 'middle';
            context.font = `700 ${canvas.height / 10}px Ubuntu`;
        
            CanvasEditor.linedText('Digturd.io', canvas.width / 2, canvas.height / 2 - 200);
        
            context.lineWidth = canvas.height / 250;
            context.font = `700 ${canvas.height / 30}px Ubuntu`;
            CanvasEditor.linedText('Eat some turd pellets to grow!', canvas.width / 2, canvas.height / 2 - 125);
        
            context.font = `700 ${canvas.height / 50}px Ubuntu`;
            CanvasEditor.linedText('This turd is named...', canvas.width / 2, canvas.height / 2 - 50);
            break;
        }
    }
    requestAnimationFrame(menu);
}

requestAnimationFrame(menu);