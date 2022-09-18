const {parentPort} = require('worker_threads');

// A listener wrapper that executes a callback
function asyncOnMessageWrap(fn) {
    return async function(msg){
        // Notifies the main thread when ready, i.e once the async function finishes
        parentPort.postMessage(await fn(msg));
    }
}

// The commands supported
const commands = {
    async square_sum(max) {
        await new Promise( res => setTimeout(res, 100));
        let sum = 0;
        for (let i=0; i < max; i++) sum += Math.sqrt(i);
        return sum;
    }
};

// Adds the listener. Passes a callback that executes the actual command
parentPort.on('message', asyncOnMessageWrap(async ({ method, params, id }) => ({
    result: await commands[method](...params), id
})));