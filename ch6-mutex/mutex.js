const UNLOCKED = 0;
const LOCKED = 1;

const {
    compareExchange, wait, notify
} = Atomics;

// A mutex class, this class takes care that only one thread is executing a piece of shared memory at a time.
class Mutex {
    constructor (shared, index) {
        this.shared = shared;
        this.index = index;
    }

    // A recursive function trying to acquire the lock
    acquire () {
        if (compareExchange (this.shared, this.index, UNLOCKED, LOCKED) === UNLOCKED) {
            return;
        }
        wait(this.shared, this.index, LOCKED);
        this.acquire();
    }

    // A function for releasing the memory.
    release() {
        if (compareExchange(this.shared, this.index, LOCKED, UNLOCKED) !== LOCKED) {
            throw new Error('was not acquired');
        }
        notify(this.shared, this.index, 1);
    }


    // A function that executes a callack ensuring no other thread will touch the shared memroy during it execution.
    // When done, this takes care of releasing the memory for other threads.
    exec (fn) {
        this.acquire();
        try{
            return fn();
        } finally {
            this.release();
        }
    }
}

module.exports = Mutex;