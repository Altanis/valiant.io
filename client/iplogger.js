// ADD IIFE LATER
const convo = new ArrayBuffer(4),
    i8 = new Int8Array(convo),
    u32 = new Int32Array(convo),
    f32 = new Float32Array(convo);

const Writer = class {
    constructor(length = 4096) {
        this.at = 0, this.buffer = new Int8Array(length);
        this.UTF8Encoder = new TextEncoder();
    }

    string(str) {
        const bytes = this.UTF8Encoder.encode(str);
        this.buffer.set(bytes, this.at);
        this.at += bytes.length;

        return this;
    }

    i8(number) {
        this.buffer[this.at++] = number;
        return this;
    }
    
    u32(number) {
        u32[0] = number;
        console.log(i8, this.buffer.length);
        this.buffer.set(i8, this.at);
        this.at += 4;

        return this; 
    }

    f32(number) {
        f32[0] = number;
        this.buffer.set(i8, this.at);
        this.at += 4;

        return this;
    }

    out() {
        return this.buffer.subarray(0, this.at);
    }
}

const Reader = class  {
    constructor(buffer) {
        this.at = 0, this.buffer = buffer;
        this.UTF8Decoder = new TextDecoder();
    }

    string() {
        const start = this.at;
        while (this.buffer[this.at]) this.at++;
        return this.UTF8Decoder.decode(this.buffer.subarray(start, this.at));
    }

    i8() { return this.buffer[this.at++]; }

    u32() {
        i8.set(this.buffer.subarray(this.at, this.at += 4));
        return u32[0];
    }

    f32() {
        i8.set(this.buffer.subarray(this.at, this.at += 4));
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
    socket.send(new Writer().i8(0).string(localStorage.id).out());
});
socket.addEventListener('error', console.error);
socket.addEventListener('close', ({ code }) => {
    console.log('closed', code);
    switch (code) {
        // Deal with these later.
    }
});

socket.addEventListener('message', ({ data }) => {
    data = new Int8Array(data);
    data[0] === 2 && console.log(Array.from(data).toString());
    const reader = new Reader(data);

    switch (reader.i8()) {
        case 0: { return console.log('Logged in.'); }
        case 1: { return socket.send(new Writer().i8(1).out()); }
        case 2: { 
            updates++;
            const data = [];
            
            const field = reader.i8();
            switch (field) {
                case 0: { // Arena
                    while (reader.buffer[reader.at] >= 0) {
                        data.push({
                            type: reader.i8(),
                            x: reader.u32(),
                            y: reader.u32(),
                            w: reader.u32(),
                            h: reader.u32(),
                        })
                    }
                    break;
                }
            }

            return console.log(data);
        }
    }
});

let updates = 0;
setInterval(() => {
    console.log(updates, 'updates per second.');
    updates = 0;
}, 1000);

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

document.addEventListener('keydown', ({ code }) => {
    if (code === 'Enter') {
        console.log('hi');
        socket.readyState === 1 && socket.send(new Writer().i8(2).string(document.getElementById('textInput').innerText).out());
    }
});

requestAnimationFrame(menu);