import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'

export default class AuthApi extends ApiBase {
    static async login(email, password) {
        return this.post(new URL(`${ApiUrl}auth/login`), {email: email, password: password})
    }
    static async forgotPassword(email) {
        return this.post(new URL(`${ApiUrl}auth/forgot-password`), {email: email})
    }
    static async register(user) {
        return this.post(new URL(`${ApiUrl}auth/register`), user)
    }
    static async user(token) {
        return this.get(new URL(`${ApiUrl}auth/user`), token)
    }
}