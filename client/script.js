(() => {
    window.canvas = window.canvas = document.getElementById('canvas');
    window.context = canvas.getContext('2d');

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

    function draw() {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 

        context.fillStyle = '#FFFFFF';
        context.strokeStyle = '#000000';
        context.lineWidth = canvas.height / 50;
        context.font = `700 ${canvas.height / 10}px Ubuntu`;

        const titleMeasure = context.measureText('Digturd.io');
        CanvasEditor.linedText('Digturd.io', (canvas.width - titleMeasure.width) / 2, canvas.height / 5 - titleMeasure.fontBoundingBoxAscent + titleMeasure.fontBoundingBoxDescent);
   
        context.lineWidth = canvas.height / 150;
        context.font = `700 ${canvas.height / 30}px Ubuntu`;

        const descriptionMeasure = context.measureText('Eat some turd pellets to turn your turd body bigger!');
        CanvasEditor.linedText('Eat some turd pellets to turn your turd body bigger!', (canvas.width - descriptionMeasure.width) / 2, canvas.height / 4.5 - descriptionMeasure.fontBoundingBoxAscent + descriptionMeasure.fontBoundingBoxDescent);
    
        context.lineWidth = canvas.height / 150;
        context.font = `700 ${canvas.height / 30}px Ubuntu`;

        const spawnMeasure = context.measureText('This turd is named...');
        CanvasEditor.linedText('This turd is named...', (canvas.width - spawnMeasure.width) / 2, canvas.height / 2.5 - spawnMeasure.fontBoundingBoxAscent + spawnMeasure.fontBoundingBoxDescent);
    }

    draw();
    window.addEventListener('resize', () => {
        draw();
    });
})();