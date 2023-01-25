const logger = require('../logger/logger');
const jayson = require('jayson');
const bbbotRpcClient = new jayson.client.http({port: 1111, path:'/rpc/anime'});

module.exports = ({ animeDbDatasource, animeMal, id }) => {
    return async function (self) {
        const anime = await animeMal(id);

        logger.info(`pushing notification anime id : ${id}`)
        bbbotRpcClient.request('pushNotifAnimeSchedule', { id }, (err, rpcRes) => {
            if(err) console.log(err);
            logger.info(`notif anime id ${id} had been pushed`);
        })
        if (anime.airing.toLowerCase().includes('finish')) {
            await animeDbDatasource.destroyAnimeCron({ animeId: id });
            logger.info(`anime ${id} is finished`);
        }
        /**
         * do we need to know the current episode of airing anime?
         * 
         */
    }
}