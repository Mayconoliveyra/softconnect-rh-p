import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import { getKnex } from "../../../../knex";
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials) {
                try {
                    if (credentials && credentials.email && credentials.password) {
                        const knex = getKnex()

                        const user = await knex("cadastro_usuarios")
                            .select("id", "nome", "email", "contato", "adm", "bloqueado")
                            .where({ email: credentials.email })
                            .whereNull("deleted_at")
                            .first()
                        if (!user) throw { email: "Email não encontrado" }
                        if (user.bloqueado == "Sim") throw { bloqueado: "Usuário bloqueado." }

                        return user
                    }
                    throw "credentials não definidas."
                } catch (error) {
                    console.log(error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async session({ session }) {
            try {
                const knex = getKnex()

                const user = await knex("cadastro_usuarios")
                    .select("id", "nome", "email", "contato", "adm", "bloqueado")
                    .where({ email: session.user.email })
                    .whereNull("deleted_at")
                    .first()
                if (!user) throw { email: "Email não encontrado" }
                if (user.bloqueado == "Sim") throw { bloqueado: "Usuário bloqueado." }

                if (user)
                    return { ...user }

                return {
                    error: "Não foi possível realizar a operação!. Por favor, atualize a página e tente novamente."
                }
            } catch (error) {
                if (error && error.response && error.response.data) {
                    return {
                        ...error.response.data
                    }
                }
                /* Se não vim nenhuma mensagem  de error, retornar mensagem padrão;*/
                return {
                    400: "Não foi possível realizar a operação!. Por favor, atualize a página e tente novamente."
                }
            }
        },
        async signIn(user, account, profile) {
            const { email } = user
            try {
                return true
            } catch (error) {
                console.log("DEU ERRO: " + error)
                return false
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}
export default (req, res) => NextAuth(req, res, authOptions)
