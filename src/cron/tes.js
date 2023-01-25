module.exports = new Promise((res, rej) => {
    const id = '69420';
    const cron = "*/2 * * * *";
    const hand = function () {
        return function (self) {
            console.log(`${id} - ${cron} - test cron`);
        }
    }
    const id2 = '69';
    const cron2 = "*/4 * * * *";
    const hand2 = function () {
        return function (self) {
            console.log(`${id2} - ${cron2} - test cron`);
        }
    }
    res([{
        cron,
        id,
        handler: hand(),
    },{
        cron: cron2,
        id: id2,
        handler: hand2(),
    }])
})