const fs = require('node:fs');
const path = require('path');

const cronProvider = fs.readdirSync(path.join(__dirname, '..', '/cron'))
    .map(location => require(path.join(__dirname, '..', '/cron', location)))
    .reduce((acc, item) => {
        acc = acc.length ? [Promise.resolve(acc)] : [acc]
        item = item.length ? [Promise.resolve(item)] : [item]
        return [...acc, ...item];
    });

async function reduce(cronProvider) {
    const row = await Promise.all(cronProvider);
    return row.reduce((acc, item) => [...acc, ...item]);
}

module.exports = reduce(cronProvider)