import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class UserApi extends ApiBase {
    static async getUsers() {
        return await this.get(new URL(`${ApiUrl}users`), session.jwtToken)
    }
    static async getUser(id, options) {
        var url = this.createUrl(`${ApiUrl}users/${id}`, options)
        return await this.get(url, session.jwtToken)
    }
    static async search(params) {
        return await this.post(new URL(`${ApiUrl}users/search`), params, session.jwtToken)
    }
    static async updateUser(id, patch) {
        var response = await this.patch(new URL(`${ApiUrl}users/${id}`), patch, session.jwtToken)
        if (response.ok && session.me?.id == id) {
            session.updateUser(patch)
        }
        return response
    }
}