// Using the mutex class to avoid race condition issues.
const Mutex = require('../ch6-mutex/mutex');

class RingBuffer {
    // Meta memory for internal calss use,
    // Buffer memory for shared use across different workers.
    constructor(meta, buffer) {
        this.meta= meta;
        this.buffer = buffer;
    }

    // Getters and setters
    get head() {
        return this.meta[0];
    }
    set head(n) {
        this.meta[0] = n;
    }
    get tail() {
        return this.meta[1];
    }
    set tail(n) {
        this.meta[1] = n;
    }
    get length() {
        return this.meta[2];
    }
    set length(n) {
        this.meta[2] = n;
    }

    // Receives a array of bytes to write in the ring buffer.
    write (data) {
        let bytesWritten = data.length;
        if (bytesWritten > this.buffer.length - this.length) {
            // Data is truncated if there is no enough space in the ring buffer
            bytesWritten = this.buffer.length - this.length;
            data = data.subarray(0, bytesWritten);
        }
        if (bytesWritten === 0) {
            return bytesWritten;
        }
        if (
            (this.head >= this.tail && this.buffer.length - this.head >= bytesWritten) ||
            (this.head < this.tail && bytesWritten <= this.tail - this.head)
        ) {
            // True ff the data is able to be put in one piece
            this.buffer.set(data, this.head);
            this.head += bytesWritten;
        } else {
            // False if the data need to be divided and placed at the end and beginning of the array buffer. 
            // The buffer is treated as a ring/circle.
            const endSpaceAvailable = this.buffer.length - this.head;
            const endChunk = data.subarray(0, endSpaceAvailable);
            const beginChunk = data.subarray(endSpaceAvailable);
            this.buffer.set(endChunk, this.head);
            this.buffer.set(beginChunk, 0);
            this.head = beginChunk.length;
        }
        this.length += bytesWritten;
        return bytesWritten;
    }
    read (bytes) {
        if(bytes > this.length) {
            // Truncate the amount of bytes to be consumed.
            bytes = this.length;
        }
        if (bytes === 0){
            return new Uint8Array(0);
        }
        let readData;
        if(this.head > this.tail || this.buffer.length - this.tail >= bytes){
            // True if all bytes can be obtained sequentiatly in the ring buffer
            // i.e the tail does not exceed the end of the buffer array
            readData = this.buffer.slice(this.tail,bytes);
            this.tail += bytes;
        } else {
            // False if all bytes need to be obtained from the end and beginning of the array buffer.
            // The buffer is treated as a ring/circle.
            readData = new Uint8Array(bytes);
            const endBytesToRead = this.buffer.length - this.tail;
            readData.set(this.buffer.subarray(this.tail, this.buffer.length));
            readData.set(this.buffer.subarray(0, bytes - endBytesToRead), endBytesToRead);
            this.tail = bytes - endBytesToRead;
        }
        this.length -= bytes;
        return readData;
    }
}

// A decorator wrapper class for the Ring buffer class
class SharedRingBuffer {
    // Uses the ring buffer class for memory storage and the mutex class to avoid race condition issues
    constructor (shared) {
        this.shared = typeof shared === 'number' ?
            new SharedArrayBuffer(shared + 16) : shared;
        this.ringBuffer = new RingBuffer(
            new Uint32Array (this.shared, 4, 3),
            new Uint8Array (this.shared, 16)
        );
        this.lock = new Mutex (new Int32Array(this.shared, 0, 1));
    }
    // Ensures this thread has the lock, executes the buffer writing, and releases the buffer
    write(data) {
        return this.lock.exec(() => this.ringBuffer.write(data));
    }
    // Ensures this thread has the lock, executes the buffer reading, and releases the buffer
    read(bytes) {
        return this.lock.exec(() => this.ringBuffer.read(bytes));
    }
}


const {isMainThread, Worker, workerData} = require ('worker_threads');
const fs = require('fs');

if(isMainThread) {
    const shared  = new SharedArrayBuffer(116);
    
    const threads = [
        // Two threads will produce data constantly, filling the buffer
        new Worker (__filename, { workerData: {shared, isProducer: true } }),
        new Worker (__filename, { workerData: {shared, isProducer: true } }),
        // Two threads will consume the data constantly, releasing memory.
        new Worker (__filename, { workerData: {shared, isProducer: false } }),
        new Worker (__filename, {workerData: {shared, isProducer: false } })
    ];
} else {
    // This will only be executed in a child worker thread.
    const {shared, isProducer} = workerData;
    const ringBuffer = new SharedRingBuffer(shared);
    if (isProducer) {
        // If it's producer, then it is constantly filling the buffer with a constant string, exactly 14 bytes.
        const buffer = Buffer.from('Hello, World\n');
        while(true) {
            ringBuffer.write(buffer);
        }
    } else {
        // If it's consumer, then it will read data from the buffer, exactly 20 bytes
        while(true){
            const readBytes = ringBuffer.read(20);
            fs.writeSync(1, `Read ${readBytes.length} bytes\n`);
        }
    }
}