async function initDb() {
    const { Sequelize, DataTypes } = require('sequelize');

    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './src/db/anime.db',
        logging: false
    });

    await sequelize.authenticate();

    return { sequelize, DataTypes };
}

async function ScheduleModel({ sequelize, DataTypes }) {
    const cron = require('croner');
    const Schedule = sequelize.define('Schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        cron: {
            type: DataTypes.STRING,
            validate: {
                isValidCron(value){
                    try {
                        cron(value);
                    } catch (error) {
                        throw new Error('cron is invalid');
                    }
                }
            }
        }
    });

    await Schedule.sync();

    return Schedule;
}

async function getAllSchedule(schedule) {
    return await schedule.findAll({ raw: true });
}

async function deleteSchedule(schedule, id) {
    return (await schedule.findByPk(id)).destroy() || new Error('no data')
}

async function addSchedule(schedule, data) {
    await schedule.create(data);
    return true;
}

async function destroy(schedule) {
    await schedule.drop();
}

module.exports = {
    initDb,
    ScheduleModel,
    getAllSchedule,
    deleteSchedule,
    addSchedule,
    destroy
}