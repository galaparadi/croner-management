const mongoose = require('mongoose');
const AnimeCron = mongoose.model('anime-cron', new mongoose.Schema({
    cron: String,
    animeId: String,
    episode: Number,
    episodeProgress: Number
}));

module.exports.getScheduledAnime = async (animeId) => {
    mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://bbb-admin:admin-bbb@galanov.tech/bbb', { useNewUrlParser: true, useUnifiedTopology: true });
    const animes = await AnimeCron.find({animeId}).lean();
    await mongoose.disconnect();
    return animes;
}

module.exports.getScheduledAnimes = async () => {
    mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://bbb-admin:admin-bbb@galanov.tech/bbb', { useNewUrlParser: true, useUnifiedTopology: true });
    const animes = await AnimeCron.find({}).lean();
    await mongoose.disconnect();
    return animes;
}

module.exports.addAnimeCron = async ({ cron, animeId }) => {
    mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://bbb-admin:admin-bbb@galanov.tech/bbb', { useNewUrlParser: true, useUnifiedTopology: true });
    const isExist = await AnimeCron.find({ animeId }).countDocuments();
    if (isExist > 0) {
        await AnimeCron.findOneAndUpdate({ animeId }, { cron });
        mongoose.disconnect();
    } else {
        const animeCron = new AnimeCron({ cron, animeId, episode: 10, episodeProgress: 1 });
        animeCron.save(err => {
            if (err) {
                console.log('mongo add anime cron error');
                console.log(err);
                return err
            };
            mongoose.disconnect();
        })
    }

}

module.exports.destroyAnimeCron = async ({ animeId }) => {
    await mongoose.connect('mongodb://bbb-admin:admin-bbb@galanov.tech/bbb', { useNewUrlParser: true, useUnifiedTopology: true });
    await AnimeCron.deleteOne({ animeId });
    await mongoose.disconnect();
}
