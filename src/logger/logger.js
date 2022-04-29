const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;

module.exports = createLogger({
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        printf(({timestamp, level, message }) => `[${timestamp}] ${level} : ${message}`),
    ),
    transports: [
        new transports.Console(),
    ]
});