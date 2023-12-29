export default class ApiBase {
    static async get(url, token) {
        const options = {
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        }
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`
        }
        return await fetch(url, options)
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
        return await fetch(url, options)
    }
}