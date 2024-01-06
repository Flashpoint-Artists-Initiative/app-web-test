import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        {{#if fetch.error}}
            <h2 class="text-red mt-0"><i class="material-icons mr-4">error_outline</i>
                {{#if fetch.notFound}}
                Not Found
                {{else if fetch.notAuthorized}}
                Not Authorized
                {{else}}
                {{fetch.error}} [{{fetch.status}}]
                {{/if}}
            </h2>
        {{else}}
            <div class="d-flex align-center">
                <h1 class="my-0 mr-auto text-truncate">{{event.name}}</h1>
                {{#if event.deleted}}
                    <span class="chip text-white bg-red ml-2">deleted</span>
                {{else if event.inactive}}
                    <span class="chip text-white bg-grey ml-2">inactive</span>
                {{/if}}
            </div>
            {{#if event.location}}<h3 class="mt-2 text-truncate">{{event.location}}</h3>{{/if}}
            <div class="text-truncate">{{event.startDate}} - {{event.endDate}}</div>
            <div class="d-flex align-center my-2">
                <i class="material-icons text-blue mr-2">history</i>
                {{#if event.ended}}<span>This event has ended</span>{{/if}}
                {{#if event.happeningNow}}<span>Happening now!</span>{{/if}}
                {{#if event.daysUntil}}<span>{{event.daysUntil}} days until event</span>{{/if}}
            </div>
            <h1>Tickets</h1>
            {{#if event.noneAvailable}}<h3 class="text-blue">No tickets available for this event yet</h3>{{/if}}
            {{#if event.saleEnded}}<h3 class="text-blue">Ticket sales ended</h3>{{/if}}
            {{#if event.availableOn}}<h3 class="text-blue">Tickets go on sale {{event.availableOn}}</h3>{{/if}}
            {{#if event.additionalAvailableOn}}<h3 class="text-blue">Additional tickets on sale {{event.additionalAvailableOn}}</h3>{{/if}}
            {{#each event.currentTickets}}
                <div class="app-ticket mdc-card mdc-card--outlined ma-2{{#if soldOut}} text-medium-emphasis{{/if}}">
                    <div {{#if canBuy}}class="mdc-card__primary-action"{{/if}}>
                    {{#if canBuy}}<a href="./ticket?id={{id}}" class="mdc-theme--on-surface">{{/if}}
                        <div class="d-flex flex-column">
                            <div class="d-flex b-bottom pa-4">
                                <div class="d-flex flex-column mr-auto">
                                    <h2 class="text-blue mt-0 mb-2">{{name}}</h2>
                                    <div>
                                        {{#if saleEnded}}Sale ended {{saleEnded}}
                                        {{else if availableOn}}<span class="text-blue">Available on {{availableOn}}</span>
                                        {{else if timeRemaining}}{{timeRemaining}}
                                        {{else if soldOut}}<span class="text-red">Sold out</span>
                                        {{/if}}
                                    </div>
                                </div>
                                <div class="d-flex flex-column align-end">
                                    <h2 class="my-0">{{#unless soldOut}}{{price}}{{/unless}}</h2>
                                    {{#if showQtyAvailable}}<div class="text-red mt-2"><strong>ONLY {{qtyAvailable}} LEFT</strong></div>{{/if}}
                                </div>
                                
                            </div>
                            <div class="pa-4">{{description}}</div>
                        </div>
                        <div class="mdc-card__ripple"></div>
                    {{#if canBuy}}</a>{{/if}}
                    </div>
                </div>
            {{/each}}
            </h3>
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class PageEvent extends HTMLElement {
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
        const dateOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }
        const dateTimeOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',

        }
        let event = this.event?.data
        if (event) {
            const now = new Date()
            const startDate = new Date(event.start_date.slice(0,-1))
            const endDate = new Date(event.end_date.slice(0,-1))
            let daysUntil = 0
            if (startDate > new Date()) {
                daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24)).toLocaleString()
            }
            const tickets = _.map(_.sortBy(event.ticket_types, 'name'), ticket => {
                const saleStartDate = new Date(ticket.sale_start_date)
                const saleEndDate = new Date(ticket.sale_end_date)

                const ticketData = {
                    id: ticket.id,
                    name: ticket.name,
                    description: ticket.description,
                    active: ticket.active,
                    deleted: ticket.deleted_at,
                    price: '$' + ticket.price.toLocaleString(undefined, {minimumFractionDigits: 2}),
                    startDate: saleStartDate,
                    endDate: saleEndDate,
                    reserved: ticket.quantity == 0,
                    qtyAvailable: Math.max(0, ticket.quantity - ticket.purchased_tickets_count - ticket.reserved_tickets_count),
                    canBuy: false
                }
                ticketData.showQtyAvailable = ticketData.qtyAvailable > 0 && ticketData.qtyAvailable < 10
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
            const pastTickets = _.filter(tickets, ticket => {
                return ticket.active && !ticket.reserved && ticket.saleEnded
            })
            const availableTickets = _.filter(tickets, ticket => {
                return ticket.active && !ticket.reserved && ticket.canBuy
            })
            const currentSoldOut = _.filter(tickets, ticket => {
                return ticket.active && !ticket.reserved && ticket.soldOut
            })
            const futureTickets = _.filter(tickets, ticket => {
                return ticket.active && !ticket.reserved && ticket.availableOn
            })
            const currentTickets = availableTickets.concat(currentSoldOut)
            event = {
                id: event.id,
                name: event.name,
                location: event.location,
                deleted: event.deleted_at,
                inactive: !event.active,
                startDate: startDate.toLocaleString(undefined, dateOptions),
                endDate: endDate.toLocaleString(undefined, dateOptions),
                ended: endDate < now,
                happeningNow: startDate <= now && endDate >= now,
                daysUntil: daysUntil,
                currentTickets: currentTickets
            }
            if (pastTickets.length && !currentTickets.length) {
                event.saleEnded = true
            }
            if (futureTickets.length && !availableTickets.length) {
                const firstSaleDate = _.minBy(futureTickets, 'startDate').startDate.toLocaleString(undefined, dateTimeOptions)
                if (pastTickets.length || currentSoldOut.length) {
                    event.additionalAvailableOn = firstSaleDate
                } else {
                    event.availableOn = firstSaleDate
                }
            }
            if (!pastTickets.length && !currentTickets.length && !futureTickets.length) {
                event.noneAvailable = true
            }
        }
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            fetch: this.fetch,
            event: event
          }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        if (!session.loaded) {
            return 
        }
        if (!this.event || this.event.meId != session.me?.id) {
            this.event = {
                meId: session.me?.id,
            }
            this.refresh()
            const id = new URLSearchParams(window.location.search).get('id');
            const options = {
                include: 'ticketTypes'
            }
            if (session.getRoles().admin) {
                options.include = 'ticketTypes,purchasedTickets,reservedTickets'
            }
            const response = await EventApi.getEvent(id, options)
            const data = await response.json()
            this.fetch = {
                done: true,
                status: response.status,
                error: !response.ok ? data.message : '',
                notFound: response.status == 404,
                notAuthorized: [401, 403].includes(response.status)
            }
            this.event.data = response.ok ? data.data : undefined
            this.refresh()
        }
    }

    refreshCallback = undefined
    fetch = {}
    event = undefined
}
customElements.define('page-event', PageEvent)