import { BLACK, WHITE, SIZE, imageOffset, syncOffset, THREADS} from './constants.js';

if(!crossOriginIsolated) throw new Error('Cannot use SharedArrayBuffer');

// Defines the canvas SIZE, and also gets the context where to paint
const gridCanvas = document.getElementById('gridcanvas');
gridCanvas.height = SIZE;
gridCanvas.width = SIZE;
const ctx = gridCanvas.getContext('2d');
const iterationCounter = document.getElementById('iteration');

// Defines the shared memory buffer
const sharedMemory = new SharedArrayBuffer(
    syncOffset + THREADS * 4
);
const imageData = new ImageData (SIZE, SIZE);
const cells = new Uint8Array (sharedMemory, 0, imageOffset);
const sharedImageBuf = new Uint32Array(sharedMemory, imageOffset);
const sharedImageBuf8 = new Uint8ClampedArray (sharedMemory, imageOffset, 4 * SIZE * SIZE);

// An initial random state for the grid
for (let x=0; x<SIZE; x++) {
    for (let y=0; y<SIZE; y++) {
        const cell = Math.random() < 0.5 ? 0 : 1;
        cells[SIZE * x + y] = cell;
        sharedImageBuf[SIZE * x + y] = cell ? BLACK : WHITE;
    }
}

imageData.data.set(sharedImageBuf8);
ctx.putImageData(imageData, 0, 0);
const chunkSize = SIZE/THREADS;

// Instantiates all workers threads with a specific range
for (let i = 0; i<THREADS; i++) {
    const worker = new Worker ('worker-thread.js', {name: `gol-worker-${i}`, type: 'module' });
    worker.postMessage({
        range: [0, chunkSize * i, SIZE , chunkSize * (i+1)],
        sharedMemory,
        i
    });
}

// Instantiates the coordination worker and post a message to start it
const coordWorker = new Worker ('coordination-thread.js', {name: `gol-coordination`, type: 'module'});
coordWorker.postMessage({coord: true, sharedMemory});
let iteration = 0;
coordWorker.addEventListener('message', () => {
    imageData.data.set(sharedImageBuf8);
    ctx.putImageData(imageData, 0, 0);
    iterationCounter.innerHTML = ++iteration;
    window.requestAnimationFrame(() => coordWorker.postMessage({}));
});
