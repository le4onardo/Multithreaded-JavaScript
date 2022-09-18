let counter = 0;

// The first stage of service worker instantiation
self.oninstall = event => {
    console.log('service worker install');
}

// The next stage after installation, this takes control of the first client that created the service worker
self.onactivate = event => {
    console.log('sevice worker activate');
    console.log(self.clients);
    event.waitUntil(self.clients.claim());
}

// A listener to intercept requests. fi the data.json info is requires then the request will send a counter number
self.onfetch = event => {
    console.log('fetch', event.request.url);

    if(event.request.url.endsWith('/data.json')) {
        counter++;
        event.respondWith(
            new Response (JSON.stringify({counter}), {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        );
        return;
    }

    event.respondWith(fetch(event.request));
}