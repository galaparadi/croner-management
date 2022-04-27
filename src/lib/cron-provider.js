const fs = require('node:fs');
const path = require('path');

const cronProvider = fs.readdirSync(path.join(__dirname, '..', '/cron'))
    .map(location => {
        const task = require(path.join(__dirname, '..', '/cron', location));
        return task // return task: Promise<object> || Promise<[object]>
    }).filter(item => {
        //TODO: check if promise
        return item.then; //check if item is Promise
    })

async function reduce(cronProvider) {
    const row = await Promise.all(cronProvider);
    return row
        .map(item => item.length ? item : [item])
        .reduce((acc, item) => [...acc, ...item]);
}

module.exports = reduce(cronProvider)