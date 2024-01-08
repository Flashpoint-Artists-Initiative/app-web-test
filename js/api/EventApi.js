import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class EventApi extends ApiBase {
    static async getEvents() {
        return await this.get(new URL(`${ApiUrl}events`), session.jwtToken)
    }
    static async getEvent(id, options) {
        var url = this.createUrl(`${ApiUrl}events/${id}`, options)
        return await this.get(url, session.jwtToken)
    }
    static async search(params) {
        return await this.post(new URL(`${ApiUrl}events/search`), params, session.jwtToken)
    }
    static async addEvent(event) {
        return await this.post(new URL(`${ApiUrl}events`), event, session.jwtToken)
    }
    static async updateEvent(event) {
        return await this.patch(new URL(`${ApiUrl}events/${event.id}`), event, session.jwtToken)
    }
}