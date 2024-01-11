export default class TicketType {
    id = null
    event_id = 0
    name = ''
    description = ''
    active = true
    price = 0
    quantity = 0
    sale_start_date = null
    sale_end_date = null
    
    static getTicketData(ticketTypes) {
        const now = new Date()
        return _.map(_.sortBy(ticketTypes, 'name'), ticket => {
            const saleStartDate = new Date(ticket.sale_start_date)
            const saleEndDate = new Date(ticket.sale_end_date)

            const ticketData = {
                id: ticket.id,
                name: ticket.name,
                description: ticket.description,
                inactive: !ticket.active,
                deleted: ticket.deleted_at,
                price: '$' + ticket.price.toLocaleString(undefined, {minimumFractionDigits: 2}),
                sale_start_date: ticket.sale_start_date,
                startDate: saleStartDate,
                sale_end_date: ticket.sale_end_date,
                endDate: saleEndDate,
                reserved: ticket.quantity == 0,
                qty: ticket.quantity,
                qtySold: ticket.purchased_tickets_count,
                qtyReserved: ticket.reserved_tickets_count,
                qtyAvailable: Math.max(0, ticket.quantity - ticket.purchased_tickets_count),
                canBuy: false
            }
            ticketData.showSoldOutSoon = ticketData.qtyAvailable > 0 && ticketData.qtyAvailable < 10
            if (saleEndDate < now) {
                ticketData.saleEnded = saleEndDate.toLocaleString()
            } else if (saleStartDate > now) {
                ticketData.availableOn = saleStartDate.toLocaleString()
            } else {
                if (ticketData.qtyAvailable) {
                    ticketData.canBuy = true
                    const minutes = Math.ceil(saleEndDate.getTime() - now.getTime()) / (1000 * 60)
                    if (minutes < 60) {
                        ticketData.timeRemaining = Math.floor(minutes) + ' minutes left'
                    } else if (minutes < 60*24) {
                        ticketData.timeRemaining = Math.floor(minutes / 60) + ' hours left'
                    } else {
                        ticketData.timeRemaining = Math.floor(minutes / (60 * 24)).toLocaleString() + ' days left'
                    }
                } else {
                    ticketData.soldOut = true
                }
            }
            return ticketData
        })
    }

    static getPurchasedTicketData(purchased, ticketTypes) {
        return _.map(purchased, ticket => {
            const type = _.find(ticketTypes, {id: ticket.ticket_type_id})
            return {
                id: ticket.id,
                name: ticket.user.display_name,
                email: ticket.user.email,
                ticketType: type?.name,
                orderDate: new Date(ticket.created_at)
            }
        })
    }

    static getReservedTicketData(reserved, ticketTypes) {
        return _.map(reserved, ticket => {
            const type = _.find(ticketTypes, {id: ticket.ticket_type_id})
            return {
                id: ticket.id,
                email: ticket.email,
                assigned: ticket.user ? true : false,
                assignedName: ticket.user?.display_name,
                assignedEmail: ticket.user?.email,
                ticketType: type?.name,
                ticketInactive: !ticket.active,
                issueDate: new Date(ticket.created_at),
                saleEndDate: new Date(type.sale_end_date),
                expirationDate: ticket.expiration_date ? new Date(ticket.expiration_date) : null,
                sold: ticket.purchased_ticket_id > 0
            }
        })
    }
}