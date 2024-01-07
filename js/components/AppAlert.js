import { session } from '../model/Session.js'

const template = `
{{#if reservedTickets.count}}
<div class="d-flex align-center text-blue bg-blue-lighten-5 rounded pa-4 ma-2">
    <i class="material-icons icon-large mr-4">new_releases</i>
    <h3 class="font-weight-normal mr-auto my-0">
        {{#if reservedTickets.multiple}}
            {{reservedTickets.count}} reserved tickets available for: {{reservedTickets.names}}
        {{else}}
            1 reserved ticket available for: {{reservedTickets.names}}
        {{/if}}
    </h3>
    <div class="ml-6 text-right">
        <button class="mdc-button mdc-button--unelevated bg-blue mb-2">
            <a href="./purchase?ticketId={{reservedTickets.id}}" class="text-white">
                <span class="mdc-button__ripple"></span>Buy
            </a>
        </button>
        <button class="mdc-button mdc-button--unelevated bg-grey ml-2 mb-2">
            <a href="./tickets" class="text-white">
                <span class="mdc-button__ripple"></span>Transfer
            </a>
        </button>
    </div>
</div>
{{/if}}
`

export class AppAlert extends HTMLElement {
    constructor() {
        super()
        this.refreshCallback = () => { this.refresh() }
    }
    connectedCallback() {
        session.addEventListener('me', this.refreshCallback)
        this.refresh()
    }
    disconnectedCallback() {
        session.removeEventListener('me', this.refreshCallback)
    }
    get templateData() {
        return {
            reservedTickets: this.getReservedTicketData()
        }
    }
    getReservedTicketData() {
        const now = new Date()
        const unsoldReservedTickets = _.chain(session.me?.reserved_tickets)
            .filter(ticket => {
                const saleStartDate = new Date(ticket.ticket_type.sale_start_date)
                const saleEndDate = new Date(ticket.expiration_date || ticket.ticket_type.sale_end_date)
                return ticket.ticket_type.active && !ticket.purchased_ticket_id && saleStartDate < now && saleEndDate > now
            })
            .sortBy(ticket => {
                return ticket.expiration_date || ticket.ticket_type.sale_end_date
            })
            .map(ticket => {
                return {
                    name: ticket.ticket_type.name,
                    ticketId: ticket.ticket_type.id
                }
            })
            .value()
        return {
            count: unsoldReservedTickets.length,
            multiple: unsoldReservedTickets.length > 1,
            id: unsoldReservedTickets.length ? unsoldReservedTickets[0].ticketId : null,
            names: _.map(_.uniqBy(unsoldReservedTickets, 'name'), 'name').sort().join(', ')
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }

    refreshCallback = undefined
}
customElements.define('app-alert', AppAlert)