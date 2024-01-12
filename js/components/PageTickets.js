import DateTime from '../model/DateTime.js'
import { session } from '../model/Session.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const MDCDialog = mdc.dialog.MDCDialog

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        <div class="d-flex">
            <h1 class="mt-0 mr-auto">Event Tickets</h1>
        </div>
        {{#if fetch.error}}
            <h2 class="text-red mt-0"><i class="material-icons mr-4">error_outline</i>
                {{#if fetch.notAuthorized}}
                Not Authorized
                {{else}}
                {{fetch.error}} [{{fetch.status}}]
                {{/if}}
            </h2>
        {{else}}
            {{#if future}}
                <h2 class="mt-0">Upcoming Events</h2>
                <div class="future-ticket-list mdc-data-table mb-6">
                    <div class="mdc-data-table__table-container">
                        <table class="mdc-data-table__table">
                            <thead>
                                <tr class="mdc-data-table__header-row">
                                    <th class="mdc-data-table__header-cell">Event Name</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">Date</th>
                                    <th class="mdc-data-table__header-cell">Ticket</th>
                                    <th class="mdc-data-table__header-cell text-right">Price</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody class="mdc-data-table__content">
                                {{#each future}}
                                <tr class="mdc-data-table__row" data-event-id="{{eventId}}">
                                    <td class="mdc-data-table__cell font-weight-bold">{{eventName}}</td>
                                    <td class="mdc-data-table__cell pr-0">{{eventStart.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2">{{eventStart.date}}</td>
                                    <td class="mdc-data-table__cell pl-0">{{eventStart.time}}</td>
                                    <td class="mdc-data-table__cell">{{name}}</td>
                                    <td class="mdc-data-table__cell text-right">{{price}}</td>
                                    <td class="mdc-data-table__cell pr-0">{{purchase.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2">{{purchase.date}}</td>
                                    <td class="mdc-data-table__cell pl-0">{{purchase.time}}</td>
                                </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    </div>
                </div>
            {{else}}
                <div>No tickets for upcoming events</div>
            {{/if}}
            {{#if reserved}}
                <h2>Reserved Tickets</h2>
                <div class="mb-4">These tickets can be bought before the expiration date listed below</div>
                <div class="reserved-ticket-list mdc-data-table mb-6">
                    <div class="mdc-data-table__table-container">
                        <table class="mdc-data-table__table">
                            <thead>
                                <tr class="mdc-data-table__header-row">
                                    <th class="mdc-data-table__header-cell">Event Name</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">Date</th>
                                    <th class="mdc-data-table__header-cell">Ticket</th>
                                    <th class="mdc-data-table__header-cell text-right">Price</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">On Sale</th>
                                    <th class="mdc-data-table__header-cell text-center" colspan="3">Offer Ends</th>
                                </tr>
                            </thead>
                            <tbody class="mdc-data-table__content">
                                {{#each reserved}}
                                <tr class="mdc-data-table__row" data-event-id="{{eventId}}">
                                    <td class="mdc-data-table__cell font-weight-bold py-2">{{eventName}}</td>
                                    <td class="mdc-data-table__cell pr-0 py-2">{{eventStart.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2 py-2">{{eventStart.date}}</td>
                                    <td class="mdc-data-table__cell pl-0 py-2">{{eventStart.time}}</td>
                                    <td class="mdc-data-table__cell py-2">{{name}}</td>
                                    <td class="mdc-data-table__cell text-right py-2">{{price}}</td>
                                    {{#if onSaleNow}}
                                        <td class="mdc-data-table__cell text-center py-2" colspan="3">NOW!</td>
                                    {{else}}
                                        <td class="mdc-data-table__cell pr-0 py-2">{{saleStart.dayOfWeek}}, </td>
                                        <td class="mdc-data-table__cell px-2 py-2">{{saleStart.date}}</td>
                                        <td class="mdc-data-table__cell pl-0 py-2">{{saleStart.time}}</td>
                                    {{/if}}
                                    <td class="mdc-data-table__cell pr-0 py-2">{{saleEnd.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2 py-2">{{saleEnd.date}}</td>
                                    <td class="mdc-data-table__cell pl-0 py-2">{{saleEnd.time}}</td>
                                </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    </div>
                </div>
            {{/if}}
            <div class="b-border my-8"></div>
            {{#if past}}
                <h1 class="mt-0">Past Events</h1>
                <div class="past-ticket-list mdc-data-table mb-6">
                    <div class="mdc-data-table__table-container">
                        <table class="mdc-data-table__table">
                            <thead>
                                <tr class="mdc-data-table__header-row">
                                    <th class="mdc-data-table__header-cell">Event Name</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">Ended</th>
                                    <th class="mdc-data-table__header-cell">Ticket</th>
                                    <th class="mdc-data-table__header-cell text-right">Price</th>
                                    <th class="mdc-data-table__header-cell" colspan="3">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody class="mdc-data-table__content">
                                {{#each past}}
                                <tr class="mdc-data-table__row" data-event-id="{{eventId}}">
                                    <td class="mdc-data-table__cell font-weight-bold">{{eventName}}</td>
                                    <td class="mdc-data-table__cell pr-0">{{eventEnd.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2">{{eventEnd.date}}</td>
                                    <td class="mdc-data-table__cell pl-0">{{eventEnd.time}}</td>
                                    <td class="mdc-data-table__cell">{{name}}</td>
                                    <td class="mdc-data-table__cell text-right">{{price}}</td>
                                    <td class="mdc-data-table__cell pr-0">{{purchase.dayOfWeek}}, </td>
                                    <td class="mdc-data-table__cell px-2">{{purchase.date}}</td>
                                    <td class="mdc-data-table__cell pl-0">{{purchase.time}}</td>
                                </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    </div>
                </div>
            {{/if}}

        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class PageTickets extends HTMLElement {
    constructor() {
        super()
        this.refreshCallback = () => { this.refresh() }
    }
    async connectedCallback() {
        session.addEventListener('loaded', this.refreshCallback)
        session.addEventListener('me', this.refreshCallback)
        await this.refresh()
    }
    disconnectedCallback() {
        session.removeEventListener('loaded', this.refreshCallback)
        session.removeEventListener('me', this.refreshCallback)
    }
    get templateData() {
        const now = new Date()
        const purchased = this.getPurchasedData()
        const future = _.filter(purchased, ticket => {
            return ticket.eventEndDate > now
        })
        const past = _.chain(purchased)
            .filter(ticket => {
                return ticket.eventEndDate <= now
            })
            .orderBy(['eventEndDate','name','purchaseDate'], ['desc','asc','asc'])
            .value()
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            fetch: this.fetch,
            future: future.length ? future : null,
            past: past.length ? past : null,
            reserved: this.getReservedTicketData()
        }
    }
    getPurchasedData() {
        return _.chain(session.me?.purchased_tickets)
            .map(ticket => {
                const purchaseDate = new Date(ticket.created_at)
                const eventStartDate = DateTime.parseISOLocalToDate(ticket.ticket_type.event.start_date)
                const eventEndDate = DateTime.parseISOLocalToDate(ticket.ticket_type.event.end_date)
                return {
                    name: ticket.ticket_type.name,
                    purchaseDate: purchaseDate,
                    price: '$' + ticket.ticket_type.price.toLocaleString(undefined, {minimumFractionDigits: 2}),
                    eventId: ticket.ticket_type.event.id,
                    eventName: ticket.ticket_type.event.name,
                    eventLocation: ticket.ticket_type.event.location,
                    eventStartDate: eventStartDate,
                    eventEndDate: eventEndDate,
                    purchase: DateTime.getDateData(purchaseDate),
                    eventStart: DateTime.getDateData(eventStartDate),
                    eventEnd: DateTime.getDateData(eventEndDate),
                }
            })
            .sortBy(['eventStartDate','name','purchaseDate'])
            .value()
    }
    getReservedTicketData() {
        const now = new Date()
        const tickets = _.chain(session.me?.reserved_tickets)
            .map(ticket => {
                const eventStartDate = DateTime.parseISOLocalToDate(ticket.ticket_type.event.start_date)
                const saleStartDate = new Date(ticket.ticket_type.sale_start_date)
                const saleEndDate = new Date(ticket.expiration_date || ticket.ticket_type.sale_end_date)
                return {
                    active: ticket.ticket_type.active,
                    purchased: ticket.is_purchased,
                    name: ticket.ticket_type.name,
                    price: '$' + ticket.ticket_type.price.toLocaleString(undefined, {minimumFractionDigits: 2}),
                    eventId: ticket.ticket_type.event.id,
                    eventName: ticket.ticket_type.event.name,
                    eventLocation: ticket.ticket_type.event.location,
                    eventStartDate: eventStartDate,
                    saleStartDate: saleStartDate,
                    saleEndDate: saleEndDate,
                    onSaleNow: saleStartDate < now && saleEndDate > now
                }
            })
            .filter(ticket => {
                return ticket.active &&!ticket.purchased && ticket.saleStartDate < now && ticket.saleEndDate > now
            })
            .value()
        tickets.forEach(ticket => {
            ticket.eventStart = DateTime.getDateData(ticket.eventStartDate)
            ticket.saleStart = DateTime.getDateData(ticket.saleStartDate)
            ticket.saleEnd = DateTime.getDateData(ticket.saleEndDate)
        })
        return tickets
    }
    async refresh() {
        this.fetch = {
            done: true,
            error: !session.isSignedIn(),
            notAuthorized: !session.isSignedIn()
        }
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        this.querySelectorAll('.reserved-ticket-list tbody tr').forEach(element => {
            element.addEventListener('click', event => {
                this.goToEvent(event.currentTarget.dataset.eventId)
            })
        })
        this.querySelectorAll('.future-ticket-list tbody tr').forEach(element => {
            element.addEventListener('click', event => {
                this.goToEvent(event.currentTarget.dataset.eventId)
            })
        })
        this.querySelectorAll('.past-ticket-list tbody tr').forEach(element => {
            element.addEventListener('click', event => {
                this.goToEvent(event.currentTarget.dataset.eventId)
            })
        })
    }
    goToEvent(eventId) {
        window.location.href = `./event?id=${eventId}`
    }

    refreshCallback = undefined
    fetch = {}
}
customElements.define('page-tickets', PageTickets)