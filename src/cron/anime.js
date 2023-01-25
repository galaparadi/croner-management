const { initDb, ScheduleModel } = require('../datasource/anime-schedule');
const { anime: animeApi } = require('../datasource/anime');
const logger = require('../logger/logger');

const anime = (instance) => {
    return async function (self) {
        try {
            // const axios = require('axios');
            // axios.post('http://localhost:1111/emb', params.toString()).then(res => console.log(res.data)).catch(err => console.log(err));
            let detail = await animeApi(instance.id);
            const axios = require('axios');
            const url = require('url');
            const params = new url.URLSearchParams({
                key: 'secret',
                message: 'minutely',
                animeId: instance.id
            });

            //sending message to bbbot
            axios.post('http://localhost:1111/anime', params.toString())
                .then(res => logger.info(`success sending message : ${detail.title} - ${instance.id}`))

            if (!detail.airing) {
                await instance.destroy()
                self.stop();
                logger.info(`${detail.title} is ended`)
            }
        } catch (error) {
            logger.error(error);
        }
    }
}

//Return Promise that resolve array of task
module.exports = (async () => {
    const animeScheduleModel = await ScheduleModel(await initDb());
    const animeScheduleInstances = await animeScheduleModel.findAll();
    animeScheduleInstances.forEach(item => logger.info(`adding : cron ${item.cron}, id ${item.id}`))
    return animeScheduleInstances.map(animeScheduleInstance => Object.assign({}, {
        cron: animeScheduleInstance.cron, handler: anime(animeScheduleInstance), id: animeScheduleInstance.id
    }))
})()