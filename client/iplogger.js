(() => {
    const canvas = window.canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Mouse position is { x: event.clientX * dpr, y: event.clientY * dpr };
    let width = 0, height = 0, dpr = 0;
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

     /* if (!localStorage.id) {
        fetch('http://localhost:3000/account/register', { method: 'POST' })
            .then(r => r.json())
            .then(response => {
                if (response.status === 'ERROR') { alert(response.data.message + `: ${response.data.dev_error || ''}`); window.location.reload(); }
                else if (response.status === 'SUCCESS') {
                    localStorage.id = response.data.id;
                }
            });
    }

    const socket = new WebSocket('wss://localhost:3000');*/

    document.getElementById('loading').style.display = 'none';
    document.getElementById('textInputContainer').style.display = 'absolute';

    const CanvasEditor = {
        linedText: (text, x, y) => { context.strokeText(text, x, y); context.fillText(text, x, y) },
    }

    function menu() {
        context.fillStyle = '#FFFFFF';
        context.strokeStyle = '#000000';
        context.lineWidth = canvas.height / 50;
        context.textAlign = 'center';
        context.textBaseLine = 'middle';
        context.font = `700 ${canvas.height / 10}px Ubuntu`;

        CanvasEditor.linedText('Digturd.io', canvas.width / 2, canvas.height / 2 - 200);
   
        context.lineWidth = canvas.height / 150;
        context.font = `700 ${canvas.height / 30}px Ubuntu`;
        CanvasEditor.linedText('Eat some turd pellets to grow!', canvas.width / 2, canvas.height / 2 - 100);
    
        context.font = `700 ${canvas.height / 50}px Ubuntu`;
        CanvasEditor.linedText('This turd is named...', canvas.width / 2, canvas.height / 2 - 50);
        requestAnimationFrame(menu);
    }

    requestAnimationFrame(menu);
})();