const bcrypt = require('bcrypt')

import { getKnex } from "../../../../knex"
import { existOrError } from "../utilities"
import { passport, dataHoraAtual } from "../../../../global"

const encryptPassword = password => {
    const salt = bcrypt.genSaltSync(11)
    return bcrypt.hashSync(password, salt)
}

export default async function handler(req, res) {
    try {
        const auth = await passport(req)
        const knex = getKnex()

        const modelo = {
            senha_old: req.body.senha_old,
            senha_new: req.body.senha_new,
            confirsenha: req.body.confirsenha,
        }

        const msgFixa = "Campo de preenchimento obrigatorio.";
        existOrError(modelo.senha_old, { senha_old: msgFixa })
        existOrError(modelo.senha_new, { senha_new: msgFixa })
        existOrError(modelo.confirsenha, { confirsenha: msgFixa })
        if (modelo.senha_new != modelo.confirsenha) throw { confirsenha: 'A confirmação de senha não confere.' }

        const usuario = await knex("cadastro_usuarios")
            .where({ id: auth.id })
            .whereNull("deleted_at")
            .first()

        /*  Valida se o usuario ta logado */
        if (!usuario) return res.status(400).send({ 500: 'Usuario não encontrado.' })

        /* Valida se a senha atual está correta. Quando ta errado o bcrypt retornar erro. */
        try {
            const isMatch = bcrypt.compareSync(modelo.senha_old, usuario.senha)
            if (!isMatch) return res.status(400).send({ senha_old: "Senha incorreta" })
        } catch (error) {
            throw { senha_old: "Senha incorreta" }
        }

        /* Senha padrão 123456 */
        /*  if (usuario.senha = '$2b$11$017rUZjZbbkbHxDQCuFgIu8YnaP2HNbaFwInqMl/YswEzcEziIoSS') {
 
         } */

        await knex("cadastro_usuarios")
            .update({ senha: encryptPassword(modelo.senha_new), updated_at: dataHoraAtual() })
            .where({ id: usuario.id })
            .then(() => res.status(204).send())
            .catch((error) => {
                console.log("######## conta.alterarsenha ########")
                console.log(error)
                return res.status(500).send()
            });

    } catch (error) {
        return res.status(400).send(error)
    }
}