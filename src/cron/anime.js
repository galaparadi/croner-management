const { initDb, ScheduleModel } = require('../datasource/anime-schedule');
const { anime: animeApi } = require('../datasource/anime');

const anime = (instance) => {
    return async function (self) {
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
        
        axios.post('http://localhost:1111/anime', params.toString()).then(res => console.log(res.data)).catch(err => console.log(err));
        if(!detail.airing){
            await instance.destroy()
            self.stop();
            console.log(`${detail.title} is ended`)
        }
    }
}

module.exports = (async () => {
    const animeScheduleModel = await ScheduleModel(await initDb());
    const animeScheduleInstances = await animeScheduleModel.findAll();
    return animeScheduleInstances.map(animeScheduleInstance => Object.assign({}, {
        cron: animeScheduleInstance.cron, handler: anime(animeScheduleInstance)
    }))
})()