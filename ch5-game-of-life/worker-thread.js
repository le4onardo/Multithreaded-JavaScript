
import { SIZE, syncOffset } from './constants.js';
import Grid from './Grid.js';

// A worker listener, it receives a range and the shared memory
// waits until the the coordination thread let it proceed with calculation.
// When it's done, it notifies the coord thread.
self.onmessage = function ({data: {range, sharedMemory, i}}) {
    const grid = new Grid(SIZE, sharedMemory);
    const sync = new Int32Array(sharedMemory, syncOffset);
    while (true) {
        Atomics.wait(sync, i, 0);
        grid.iterate(...range);
        Atomics.store(sync, i, 0);
        Atomics.notify(sync, i);
    }
}