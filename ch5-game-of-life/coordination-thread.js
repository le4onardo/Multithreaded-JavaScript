import {SIZE, syncOffset, imageOffset, BLACK, WHITE, THREADS} from './constants.js';

let sharedImageBuf;
let nextCells;
let cells;
let sync;

self.onmessage = initListener;

// An initial message listener, it instantiates the views and variables needed in this thread.
function initListener(msg) {
    const opts = msg.data;
    let sharedMemory = opts.sharedMemory;
    sync = new Int32Array(sharedMemory, syncOffset);
    self.removeEventListener('message', initListener);

    self.onmessage = runCoord;
    cells = new Uint8Array(sharedMemory);
    nextCells = new Uint8Array(sharedMemory, SIZE * SIZE);
    sharedImageBuf = new Uint32Array(sharedMemory, imageOffset);
    runCoord();
}

// A message listener for running the app. It lets all threads know they are ready to operate,
// the it waits for all of them to finish. Then it updates the colors and notifies the main thread
// that the new state has been completed
function runCoord() {
    for (let i=0; i<THREADS; i++) {
        Atomics.store(sync, i, 1);
        Atomics.notify(sync, i);
    }
    for(let i=0; i<THREADS; i++) {
        Atomics.wait(sync, i, 1);
    }
    const oldCells = cells;
    cells = nextCells;
    for (let x = 0; x<SIZE; x++) {
        for (let y =0; y<SIZE; y++) {
            sharedImageBuf[SIZE * x + y] = cells[SIZE * x + y] ? BLACK : WHITE;
        }
    }
    self.postMessage({});
}