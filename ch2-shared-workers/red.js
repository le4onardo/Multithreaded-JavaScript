console.log('red.js');

// Shared worker instantiation, this worker can be shared across multiple contexts, i.e browser tabs
const worker = new SharedWorker('shared-worker.js');

// A listener for messages that come from the shared worker
worker.port.onmessage = (event) => {
  console.log('EVENT', event.data);
};