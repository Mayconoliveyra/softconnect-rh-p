const knex = require("knex")
const config = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        dateStrings: true,
    },
    pool: {
        min: 0,
        max: 7
    },
    migrations: {
        directory: './knex/migrations',
    },
    seeds: {
        directory: './knex/seeds',
    },
}

let conexao = global.pg
if (!conexao) conexao = global.pg = {}

const getKnex = () => {
    if (!conexao.instance) {
        console.log("createConnection")
        conexao.instance = knex(config)
        /* conexao.instance.migrate.latest() */
    }

    return conexao.instance
}

module.exports = { getKnex }