const fs = require('node:fs');
const path = require('path');

const cronProvider = fs.readdirSync(path.join(__dirname, '..', '/cron'))
    .map(location => {
        const task = require(path.join(__dirname, '..', '/cron', location));
        return task // return task: Promise<object> || Promise<[object]>
    }).filter(item => {
        return item.then; //check if item is Promise
    })

async function reduce(cronProvider) {
    const row = await Promise.allSettled(cronProvider);
    return row
        .filter(item => item.value)
        .map(item => item.value)
        .map(item => Array.isArray(item) ? item : [item])
        .reduce((acc, item) => [...acc, ...item]);
}

module.exports = reduce(cronProvider)