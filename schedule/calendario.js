const cron = require('node-cron');
const moment = require("moment");

const { getKnex } = require("../knex")
const { dataHoraAtual } = require("../global")

cron.schedule('*/1 * * * *', async function () {
    const knex = getKnex()
    /* await knex("calendario")
        .then((pontos) => console.log(pontos))
        .catch((error) => {
            console.log("######## schedule.calendario ########")
            console.log(error)
        }); */

    /* console.log('Say scheduled hello')

    const dataAtualFormat = moment(dataHoraAtual()).format('YYYY-MM-DD');
    await knex("cadastro_pontos")
        .select("id", "data")
        .whereRaw(`DATE(data) = '${dataAtualFormat}'`)
        .whereNull("deleted_at")
        .orderBy("id", "ASC")
        .then((pontos) => console.log(pontos))
        .catch((error) => {
            console.log("######## schedule.calendario ########")
            console.log(error)
        }); */
});
