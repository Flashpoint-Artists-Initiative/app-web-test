import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class TicketTypeApi extends ApiBase {
    static async getTicketTypes(eventId) {
        return await this.get(new URL(`${ApiUrl}events/${eventId}/ticket_types`), session.jwtToken)
    }
    static async addTicketType(ticket) {
        const eventId = ticket.event_id
        return await this.post(new URL(`${ApiUrl}events/${eventId}/ticket-types`), ticket, session.jwtToken)
    }
    static async updateTicketType(ticket) {
        const eventId = ticket.event_id
        return await this.patch(new URL(`${ApiUrl}events/${eventId}/ticket-types/${ticket.id}`), ticket, session.jwtToken)
    }
    static async deleteTicketType(eventId, ticketTypeId) {
        return await this.delete(new URL(`${ApiUrl}events/${eventId}/ticket-types/${ticketTypeId}`), session.jwtToken)
    }
}