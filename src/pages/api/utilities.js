import { getKnex } from "../../../knex";

const existOrError = (value, msg) => {
    if (!value) throw msg;
    if (Array.isArray(value) && value.length === 0) throw msg;
    if (typeof value === "string" && !value.trim()) throw msg;
}
const notExistOrError = (value, msg) => {
    try {
        existOrError(value, msg);
    } catch (msg) {
        return;
    }
    throw msg;
}
const notExistOrErrorDB = async ({ table, column, data, id }, msg) => {
    const knex = getKnex()
    const dataDB = await knex.raw(`
        SELECT * FROM 
        ${table} 
        WHERE ${column} = '${data}' 
        AND id != '${id}'`)

    notExistOrError(dataDB[0], msg)
    return
}
const existOrErrorDB = async ({ table, column, data }, msg) => {
    const knex = getKnex()
    const dataDB = await knex.raw(`
        SELECT * FROM 
        ${table} 
        WHERE ${column} = '${data}' 
        AND deleted_at IS NULL`)

    existOrError(dataDB[0], msg)
    return
}
const utility_console = (name = null, error = null, saveDB = true) => {
    console.log("########################################")
    console.log(`Function: ${name}`);
    console.log(JSON.stringify(error));
    console.log("########################################")
    /* Salva no banco de dados */
    if (saveDB) {
        const moodelo = {
            id_store: app.store.id,
            name: name,
            error: JSON.stringify(error),
        };

        getKnex.insert(moodelo)
            .table("_error_backend")
            .then()
            .catch((error) =>
                console.log("Utility_console: " + error)
            );
    }
}
export {
    existOrError,
    notExistOrError,
    notExistOrErrorDB,
    existOrErrorDB,
    utility_console,
};

