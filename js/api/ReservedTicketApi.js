import { ApiUrl } from './env.js'
import ApiBase from './ApiBase.js'
import { session } from '../model/Session.js'

export default class ReservedTicketApi extends ApiBase {
    static async addReservedTicket(ticket) {
        const ticketTypeId = ticket.ticket_type_id
        return await this.post(new URL(`${ApiUrl}ticket-types/${ticketTypeId}/reserved-tickets`), ticket, session.jwtToken)
    }
    static async updateReservedTicket(ticket) {
        const ticketTypeId = ticket.ticket_type_id
        return await this.patch(new URL(`${ApiUrl}ticket-types/${ticketTypeId}/reserved-tickets/${ticket.id}`), ticket, session.jwtToken)
    }
    static async deleteReservedTicket(ticketTypeId, reservedTicketId) {
        return await this.delete(new URL(`${ApiUrl}ticket-types/${ticketTypeId}/reserved-tickets/${reservedTicketId}`), session.jwtToken)
    }
}