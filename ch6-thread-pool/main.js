#!/usr/bin/env node
const http = require('http');
const RpcWorkerPool = require('./rpc-worker.js');

// Instantiates a rpc worker pool with a number of threads and a strategy
const worker = new RpcWorkerPool ('./worker.js', Number(process.env.THREADS), process.env.STRATEGY);

// Server to execute the worker pull when a request comes in.
const server  = http.createServer( async (req, res) => {
    const value = Math.floor(Math.random() * 100_000_000);
    const sum = await worker.exec('square_sum', value);
    res.end(JSON.stringify({sum, value}));
});

server.listen(1337, (err) => {
    if(err) throw err;
    console.log('http://localhost:1337/');
});

