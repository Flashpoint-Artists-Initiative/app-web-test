import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class UserApi extends ApiBase {
    static async updateUser(id, patch) {
        var response = await this.patch(new URL(`${ApiUrl}users/${id}`), patch, session.jwtToken)
        if (response.ok && session.me?.id == id) {
            session.updateUser(patch)
        }
        return response
    }
}