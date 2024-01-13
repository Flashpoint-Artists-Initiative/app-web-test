import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class CartApi extends ApiBase {
    static async addCart(info) {
        return await this.post(new URL(`${ApiUrl}cart`), info, session.jwtToken)
    }
}