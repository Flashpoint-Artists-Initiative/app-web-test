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
        const options = { method: 'POST', headers: {} }
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