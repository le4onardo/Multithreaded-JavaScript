// This class encapsulates a web worker and provides to methods for interaction with it

class RpcWorker {

    // The worker gets instantiated and gets a message listener for external comunication.
    constructor(path) {
        this.next_command_id = 0;
        this.in_flight_commands = new Map();
        this.worker  = new Worker(path);
        this.worker.onmessage = this.onMessageHandler.bind(this);
    }

    // The listener rejects or resolves the previous returned promise according to the worker msg
    onMessageHandler (msg) {
        const {result, error, id} = msg.data;
        const {resolve, reject} = this.in_flight_commands.get(id)
        this.in_flight_commands.delete(id);
        if(error) reject(error);
        else resolve(result);
    }

    // This method sends the command to execute to the worker. Returns a promise that will be resolved in the worker listener
    exec(method, ...args) {
        const id = ++this.next_command_id;
        let resolve,reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        })
        this.in_flight_commands.set(id, {resolve,reject});
        this.worker.postMessage({method, params: args, id});
        return promise;
    }
}