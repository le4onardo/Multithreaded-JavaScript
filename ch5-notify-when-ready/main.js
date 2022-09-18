if(!crossOriginIsolated) throw new Error('Cannot use SharedArrayBuffer');

const buffer = new SharedArrayBuffer(128);
const view = new Int32Array(buffer);
const now = Date.now();
let count = 4;

// Creates a worker for every byte in the buffer array. 
for (let i = 0; i<buffer.byteLength; i++) {
    const worker = new Worker('worker.js');
    worker.postMessage({buffer, name: i});
    worker.onmessage = () => {
        // Show the the time when the message was received.
        console.log(`Ready; id=${i}, count=${--count}, time=${Date.now() - now}ms`);
        // When the last message is received, all workers threads are awoken
        if(count === 0) {
            Atomics.notify(view, 0);
        }
    };
}