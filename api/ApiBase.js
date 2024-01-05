import { session } from '../model/Session.js'

export default class ApiBase {
    static async get(url, token) {
        return await this.request('GET', url, null, token)
    }
    static async post(url, data, token) {
        return await this.request('POST', url, data, token)
    }
    static async patch(url, data, token) {
        return await this.request('PATCH', url, data, token)
    }
    static async request(method, url, data, token) {
        const options = { method: method, headers: {} }
        if (data) {
            options.body = JSON.stringify(data)
            options.headers['Content-Type'] = 'application/json; charset=UTF-8'
        }
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`
        }
        try {
            const response = await fetch(url, options)
            const authorization = response.headers?.get('Authorization')?.split(' ')
            if (authorization?.length > 1 && authorization[0] == 'Bearer') {
                session.setToken(authorization[1])
            }
            return response
        } catch {
            return {ok: false, status: 500, json: function() { return {message: 'server error'}}}
        }
    }
}