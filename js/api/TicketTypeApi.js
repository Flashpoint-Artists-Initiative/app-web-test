import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class TicketTypeApi extends ApiBase {
    static async getTicketTypes(eventId) {
        return await this.get(new URL(`${ApiUrl}events/${eventId}/ticket_types`), session.jwtToken)
    }
    static async search(params) {
        return await this.post(new URL(`${ApiUrl}ticket_types/search`), params, session.jwtToken)
    }
}