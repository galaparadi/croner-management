const provider = require('./lib/cron-provider');
const Cron = require('croner');
const jayson = require('jayson');
const server = new jayson.Server({
    ping: function (args, callback) {
        console.log('pong')
        callback(null, 'pong');
    },
    countCronMap: function (args, cb) {
        cb(null, CronMap.size);
    },
    destroyCron: function (args, cb) {
        const { id } = args;
        logger.info(`RPC : Destroying cron with id ${id}`)
        if (!CronMap.get(id)) return cb({ code: 400, message: `${id} is not found` });
        destroyAnimeCron({ animeId: id }).catch(error => {
            logger.error(`RPC : error destroying anime cron : ${error.message}`)
        })
        CronMap.get(id).stop();
        CronMap.delete(id);
        return cb(null, `${id} will stop`);
    },
    getCron: function (args, cb) {
        const { id } = args;

        let cron = CronMap.get(id);
        if(!cron) return cb({message: 'cron not set'});

        scheduledAnime(id).then(anime => {
            cb(null, anime);
        }).catch(error => {
            logger.error(`RPC : error getting anime scheculde of ${id} : ${error.message}`)
            cb(error);
        })
    },
    addSchedule: function (args, cb) {
        const animeDbDatasource = require('./datasource/anime-model');
        const { anime: animeMal } = require('./datasource/anime-mal');
        const { cron, id: animeId } = args;
        //TODO: add validation : only airing anime that can be added
        addAnimeCron({ cron, animeId }).then(anime => {

            if (CronMap.get(animeId)) {
                CronMap.get(animeId).stop();
                CronMap.delete(animeId);
            }

            CronMap.set(
                animeId.toString(),
                Cron(cron,
                    animeHandler({
                        animeDbDatasource,
                        animeMal,
                        id: animeId
                    })
                )
            );
            cb(null, { message: 'add schedule from croner' });
        }).catch(error => {
            logger.error(`RPC : error adding anime cron : ${error.message}`)
            cb(error);
        })
    },
    getSchedule: function (args, cb) {
        scheduledAnimes().then(animes => {
            cb(null, animes);
        }).catch(error => {
            logger.error(`RPC : error getting anime scheculdes : ${error.message}`)
            cb(error);
        })
    }
})

server.tcp().listen(5678);

(async () => {
    const handlers = await provider;
    handlers.forEach(item => {
        CronMap.set(item.id.toString(), Cron(item.cron, item.handler));
        logger.info(`${item.id.toString()} added with cron ${item.cron}`)
    });
})().catch(err => {
    logger.error(`croner main error : ${err.message}`)
    })
