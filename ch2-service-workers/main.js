// Service worker instantiation, this leaves even if the main thread that created it is closed.
navigator.serviceWorker.register('/sw.js', {
    scope: '/'
});

// A listener to know if the service worker has taken controll of the page, i.e. all request will pass through it
navigator.serviceWorker.oncontrollerchange = () => {
    console.log('controller change');
};

// Request function, this will be intercepted.
async function makeRequest () {
    const result = await fetch ('/data.json');
    const payload = await result.json();
    console.log(payload);
}