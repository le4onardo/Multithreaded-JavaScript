// Listener. It gets the buffer and made some changes on it through another view.
self.onmessage = ({data: buffer})=>{
    buffer.foo = 42;
    const view = new Uint8Array(buffer);
    view[0] = 2;
    console.log('updated in worker');
}