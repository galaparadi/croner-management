const provider = require('./lib/cron-provider');
const Cron = require('croner');

(async() => {
    const handlers = await provider;
    // console.log(handlers);
    handlers.forEach(item => {
        Cron(item.cron, item.handler);
    })
})()
