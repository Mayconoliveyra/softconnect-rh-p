import { getKnex } from "../../../../knex"
import { existOrError } from "../utilities"
const bcrypt = require('bcrypt')

export default async function handler(req, res) {
    const knex = getKnex()

    const modelo = {
        email: req.body.email,
        senha: req.body.senha,
    }

    try {
        existOrError(modelo.email, { email: "E-mail é obrigatório" })
        existOrError(modelo.senha, { senha: "Senha é obrigatório" })

        if (!modelo.senha.length >= 3) throw { senha: "A senha precisa ter no minimo 3 caracteres." }

        const user = await knex("cadastro_usuarios")
            .where({ email: modelo.email })
            .whereNull("deleted_at")
            .first()
        if (!user) throw { email: "Email não encontrado" }
        if (user.bloqueado == "Sim") return res.status(400).send({ 500: "Usuário bloqueado." })

    } catch (error) {
        return res.status(400).send(error)
    }

    try {
        const user = await knex("cadastro_usuarios")
            .where({ email: modelo.email })
            .whereNull("deleted_at")
            .first()
        const isMatch = bcrypt.compareSync(modelo.senha, user.senha)
        if (!isMatch) return res.status(400).send({ senha: "Senha incorreta" })

        return res.status(204).send()
    } catch (error) {
        return res.status(400).send({ senha: "Senha incorreta" })
    }
}