const animeHandler = require('../handler/anime');
const animeDbDatasource = require('../datasource/anime-model');
const { anime: animeMal } = require('../datasource/anime-mal');
const logger = require('../logger/logger')

const handler = (animeId) => {
    return animeHandler({ animeDbDatasource, animeMal, id: animeId });// context 
}

const queryDatabase = async () => {
    const scheduledAnimes = await animeDbDatasource.getScheduledAnimes();
        let crons = [];

        if (scheduledAnimes.length <= 0) {
            logger.error("cron -> anime -> queryDatabase : Db is empty");
            throw "Cron on database empty"
        };

        scheduledAnimes.forEach(anime => {
            crons.push({
                id: anime.animeId,
                cron: anime.cron,
                handler: handler(anime.animeId),
            })
        });
        return crons;
}
module.exports = queryDatabase();