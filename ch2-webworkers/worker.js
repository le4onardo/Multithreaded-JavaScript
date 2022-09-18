console.log('hello from worker.js')

// A listener for messages received from the main thread
self.onmessage = (msg) => {
    console.log('message from main:', msg.data);

    // A message sent to the main thread
    postMessage('message sent from worker');
}
console.log('end of worker.js')