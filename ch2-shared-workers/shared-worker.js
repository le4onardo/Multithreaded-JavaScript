const ID = Math.floor(Math.random()* 999999);
console.log('shared-worker.js', ID);
const ports = new Set();

// A listener for every context that connects, i.e instantiates, this shared worker
self.onconnect = event => {
    const port = event.ports[0];
    ports.add(port);
    console.log('CONN', ID, ports.size);

    // Listener for every message sent from main thread to this shared worker thread
    port.onmessage = event => {
        console.log('MESSAGE:', ID, event.data);
        for(let p of ports){
            
            // Sends a message to all thread connected to this shared worker.
            p.postMessage([ID, event.data]);
        }
    }
}