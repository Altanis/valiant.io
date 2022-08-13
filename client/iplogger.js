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

const CanvasEditor = {
    linedText: (text, x, y, stroke = true) => { stroke && context.strokeText(text, x, y); context.fillText(text, x, y) },
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

document.getElementById('textInput').onkeypress = document.getElementById('textInput').onpaste = limit_input(15);

class Game {
    constructor() {
        this.screen = 0;
        this.data = {};

        this.socket = null;

        if (!localStorage.id) this.register();
        this.connect();
    }

    _parseField(reader) {
        const data = {};
        const field = reader.i8();
    
        switch (field) {
            case 0: {
                data.type = 'turd';
                data.turd = [];
                while (reader.buffer[reader.at] >= 0) {
                    data.turd.push({
                        type: reader.i8(),
                        x: reader.u32(),
                        y: reader.u32(),
                        w: 1,
                        h: 1,
                    });
                }
    
                break;
            }
            case 1: {
                data.type = 'player';
                data.player = {
                    color: reader.i8(),
                    points: reader.u32(),
                    x: reader.u32(),
                    y: reader.u32(),
                    w: reader.u32(),
                    h: reader.u32(),
                };
            }
        }
    
        return data;
    }

    register() {
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

    connect() {
        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.binaryType = 'arraybuffer';
        
        this.socket.addEventListener('open', () => {
            console.log('[WEBSOCKET]: Socket opened.');
            this.socket.send(new Writer().i8(0).string(localStorage.id).out());
        
            document.getElementById('loading').style.display = 'none';
            document.getElementById('textInput').style.display = 'block';

            this.render();
            requestAnimationFrame(this.render.bind(this));
        });

        this.socket.addEventListener('error', console.error);
        this.socket.addEventListener('close', ({ code }) => {
            console.log('closed', code);
            switch (code) {
                // Deal with these later.
            }
        });

        this.socket.addEventListener('message', ({ data }) => {
            data = new Int8Array(data);
            const reader = new Reader(data);
        
            switch (reader.i8()) {
                case 0: { return console.log('Logged in.'); }
                case 1: { return this.socket.send(new Writer().i8(1).out()); }
                case 2: { 
                    updates++;
        
                    while (reader.buffer.length !== reader.at) {
                        const d = this._parseField(reader);
                        this.data[d.type] = d[d.type];
                    }

                    console.log(this.data);
                
                    if (this.screen !== 1) {
                        document.getElementById('textInput').style.display = 'none';
                        this.screen = 1;
                    }        
                }
            }
        });
    }

    _normalize(x, y, posX, posY) {
        // doesn't work
        const distX = posX - x, distY = posY - y,
            scaledHeight = canvas.height / 5, scaledWidth = canvas.width / 5;

        return { x: distX * scaledHeight, y: distY * scaledWidth };
    }

    render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (fps.length > 10) fps.shift();

        switch (this.screen) {
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
            case 1: {
                const { turd, player } = this.data;
                
                const height = canvas.height / turd.length, width = canvas.width / turd.length;
                
                for (const t of turd) {
                    const { x, y } = this._normalize(t.x, t.y, player.x, player.y);
                    context.rect(x, y, height, width);
                    context.fill();
                }
            }
        }

        let now = performance.now();
        fps.push(Math.round(1000 / (now - lastLoop)));
        avgFPS = (fps.reduce((a, b) => a + b) / fps.length).toFixed(1);
        lastLoop = now;
    
        context.fillStyle = '#FFFFFF';
        context.lineWidth = canvas.height / 250;
        context.font = `${canvas.height / 100}px Ubuntu`;
    
        CanvasEditor.linedText(`${avgFPS} FPS`, canvas.height / 40, canvas.height / 60);

        requestAnimationFrame(this.render.bind(this));
    }
}

let updates = 0;
setInterval(() => {
    console.log(updates, 'updates per second.');
    updates = 0;
}, 1000);

document.addEventListener('keydown', ({ code }) => {
    if (code === 'Enter' && document.activeElement === document.getElementById('textInput')) {
        game.socket.readyState === 1 && game.socket.send(new Writer().i8(2).string(document.getElementById('textInput').innerText).out());
    }
});

const game = new Game();