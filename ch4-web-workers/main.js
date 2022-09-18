// In order to use shared memory buffers, checks if required http headers are available
if(!crossOriginIsolated){
    throw new Error('Cannot use SharedArrayBuffer');
}

const worker = new Worker ('worker.js');

// 1024 bytes
const buffer = new SharedArrayBuffer(1024);

// We need views to work with buffers. Unsigned 8 bits view represents a byte array.
const view = new Uint8Array(buffer);

console.log('now', view[0]);

// Sharing the buffer with dedicated worker
worker.postMessage(buffer);

// Checking the buffer after 500 ms, it displays the values that where changed on the worker.
setTimeout(() => {
    console.log('later', view[0]);
    console.log('prop', buffer.foo);
}, 500);