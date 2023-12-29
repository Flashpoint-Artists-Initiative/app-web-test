import { ApiUrl } from './env.js'
import { session } from '../model/Session.js'

export default class AuthApi {
    static async login(email, password) {
        const url = new URL(`${ApiUrl}auth/login`)
        return await fetch(url, {
            method: 'POST',
            body: JSON.stringify({email: email, password: password}),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        })
    }

    static async register(user) {
        const url = new URL(`${ApiUrl}auth/register`)
        return await fetch(url, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        })
    }

    static async user(token) {
        const url = new URL(`${ApiUrl}auth/user`)
        return await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' }
        })
    }
}