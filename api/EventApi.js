import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class EventApi extends ApiBase {
    static async getEvents() {
        return await this.get(new URL(`${ApiUrl}events`), session.jwtToken)
    }
    static async getEvent(id) {
        return await this.get(new URL(`${ApiUrl}events/${id}`), session.jwtToken)
    }
}