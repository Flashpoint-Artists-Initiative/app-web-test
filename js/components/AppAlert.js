import { session } from '../model/Session.js'

const template = `
{{#if reservedTickets.count}}
<div class="reserved-tickets-alert d-flex align-center text-white bg-blue pa-4">
    <i class="material-icons icon-large mr-4">new_releases</i>
    <h3 class="font-weight-normal mr-auto my-0">
        {{#if reservedTickets.multiple}}
            {{reservedTickets.count}} reserved tickets available for: {{reservedTickets.names}}
        {{else}}
            1 reserved ticket available for: {{reservedTickets.names}}
        {{/if}}
    </h3>
    <div class="ml-6 text-right">
        <button class="mdc-button mdc-button--outlined text-white bg-blue mb-2">
            <a href="./shop?event-id={{reservedTickets.eventId}}&reserved" class="text-white">
                <span class="mdc-button__ripple"></span>Buy
            </a>
        </button>
        <button class="mdc-button mdc-button--outlined text-white bg-blue ml-2 mb-2">
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
                return ticket.ticket_type.active && !ticket.is_purchased && saleStartDate < now && saleEndDate > now
            })
            .sortBy(ticket => {
                return ticket.expiration_date || ticket.ticket_type.sale_end_date
            })
            .map(ticket => {
                return {
                    name: ticket.ticket_type.name,
                    eventId: ticket.ticket_type.event_id
                }
            })
            .value()
        return {
            count: unsoldReservedTickets.length,
            multiple: unsoldReservedTickets.length > 1,
            eventId: unsoldReservedTickets.length ? unsoldReservedTickets[0].eventId : null,
            names: _.map(_.uniqBy(unsoldReservedTickets, 'name'), 'name').sort().join(', ')
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }

    refreshCallback = undefined
}
customElements.define('app-alert', AppAlert)