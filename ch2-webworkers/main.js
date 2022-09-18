console.log('hello from main.js');

// Dedicated worker instantiation, this initializes another real thread on the computer
const worker = new Worker ('worker.js');

// A listener for messages sent from the worker thread to this main thread
worker.onmessage = (msg) => {
    console.log('message received from worker:', msg.data);
}


// A message sent from the main thread to the worker thread
worker.postMessage('message sent to worker');

console.log('hello from end of main.js');