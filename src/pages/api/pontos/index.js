import { getKnex } from "../../../../knex"
import { existOrError } from "../utilities"
import { passport, dataHoraAtual } from "../../../../global"
import moment from "moment/moment"

export default async function handler(req, res) {
    const auth = await passport(req)
    const knex = getKnex()

    if (req.method === 'GET') {
        try {
            const sortColuns = {
                id: "id",
                data: "data",
                entrada1: "entrada1",
                saida1: "saida1",
                entrada2: "entrada2",
                saida2: "saida2",
                dif_total: "dif_total",
            }
            const orderColuns = {
                ASC: "ASC",
                asc: "ASC",
                DESC: "DESC",
                desc: "DESC",
            }
            const page = parseInt(req.query._page) ? parseInt(req.query._page) : 1;
            const limit = parseInt(req.query._limit) ? parseInt(req.query._limit) : 20;
            const sort = sortColuns[req.query._sort] ? sortColuns[req.query._sort] : 'id';
            const order = orderColuns[req.query._order] ? orderColuns[req.query._order] : 'ASC';

            const dinicial = req.query._dinicial ? req.query._dinicial : null
            const dfinal = req.query._dfinal ? req.query._dfinal : null

            existOrError(dinicial, "Data inical deve ser informada.")
            existOrError(dfinal, "Data final deve ser informada.")

            const { totalPags } = await knex("vw_cadastro_pontos")
                .where({ id_usuario: auth.id })
                .count({ totalPags: "*" })
                .whereRaw(`DATE(data) BETWEEN '${dinicial}' AND '${dfinal}'`)
                .first()

            const pontos = await knex("vw_cadastro_pontos")
                .select()
                .where({ id_usuario: auth.id })
                .whereRaw(`DATE(data) BETWEEN '${dinicial}' AND '${dfinal}'`)
                .limit(limit).offset(page * limit - limit)
                .orderBy(sort, order)

            return res.status(200).json({ data: pontos, totalPags: Math.ceil(totalPags / limit) })

        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    }

    if (req.method === 'POST') {
        try {
            /* formata 'dataHoraAtual', para retornar apenas yyyy-mmm-dd(ano-mes-dia) */
            const dataAtualFormat = moment(dataHoraAtual()).format('YYYY-MM-DD');
            const horaFormat = moment(dataHoraAtual()).format('HH:mm:00') /* Segundos ta fixo 00 */

            /* Verifica se tem algum ponto em aberto. (se ponto_saida = null, significa que ta em aberto.) */
            const ponto = await knex("vw_cadastro_pontos")
                .where({ id_usuario: auth.id, data: dataAtualFormat })
                .first()

            existOrError(ponto, `Não foi encontrado ponto com a data atual: ${dataAtualFormat}`)

            if (!ponto.entrada1) {
                await knex("cadastro_pontos")
                    .update({ entrada1: horaFormat })
                    .where({ id: ponto.id })
                    .then(() => res.status(204).send())
                    .catch((error) => {
                        console.log("######## ponto.registrar[ponto.entrada1] ########")
                        console.log(error)
                        return res.status(500).send()
                    });
            } else
                if (!ponto.saida1) {
                    await knex("cadastro_pontos")
                        .update({ saida1: horaFormat })
                        .where({ id: ponto.id })
                        .then(() => res.status(204).send())
                        .catch((error) => {
                            console.log("######## ponto.registrar[ponto.saida1] ########")
                            console.log(error)
                            return res.status(500).send()
                        });
                } else
                    if (!ponto.entrada2) {
                        await knex("cadastro_pontos")
                            .update({ entrada2: horaFormat })
                            .where({ id: ponto.id })
                            .then(() => res.status(204).send())
                            .catch((error) => {
                                console.log("######## ponto.registrar[ponto.entrada2] ########")
                                console.log(error)
                                return res.status(500).send()
                            });
                    } else
                        if (!ponto.saida2) {
                            await knex("cadastro_pontos")
                                .update({ saida2: horaFormat })
                                .where({ id: ponto.id })
                                .then(() => res.status(204).send())
                                .catch((error) => {
                                    console.log("######## ponto.registrar[ponto.saida2] ########")
                                    console.log(error)
                                    return res.status(500).send()
                                });
                        } else {
                            existOrError(false, `O registro do ponto já foi finalizado.`)
                        }
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}