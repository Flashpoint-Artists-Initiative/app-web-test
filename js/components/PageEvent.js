import { session } from '../model/Session.js'
import TicketType from '../model/TicketType.js'
import EventApi from '../api/EventApi.js'
import TicketTypeApi from '../api/TicketTypeApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'
import { TabBar } from './mdc/TabBar.js'
import { Tab } from './mdc/Tab.js'

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

            {{#if roles.admin}}
                <mdc-tab-bar class="main-tab-bar">
                    {{#each mainTabs}}
                        <mdc-tab {{#if active}}active {{/if}}title="{{title}}"></mdc-tab>
                    {{/each}}
                </mdc-tab-bar>
                <div class="tab-pages my-4">
                    <div style="display:none">
                        <div class="mdc-data-table">
                            <div class="mdc-data-table__table-container">
                                <table class="mdc-data-table__table">
                                    <thead>
                                        <tr class="mdc-data-table__header-row">
                                            <th class="mdc-data-table__header-cell text-center">Status</th>
                                            <th class="mdc-data-table__header-cell">Name</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Sale Date</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">End Date</th>
                                            <th class="mdc-data-table__header-cell text-right">Price</th>
                                            <th class="mdc-data-table__header-cell text-right">Quantity</th>
                                            <th class="mdc-data-table__header-cell text-right">Sold</th>
                                            <th class="mdc-data-table__header-cell text-right">Reserved</th>
                                            <th class="mdc-data-table__header-cell text-right">Available</th>
                                        </tr>
                                    </thead>
                                    <tbody class="mdc-data-table__content">
                                        {{#each event.tickets}}
                                        <tr class="mdc-data-table__row{{#if inactive}} text-disabled{{/if}}">
                                            <td class="mdc-data-table__cell text-center">
                                                {{#if deleted}}
                                                    <span class="text-red">deleted</span>
                                                {{else if inactive}}
                                                    <span class="">inactive</span>
                                                {{else if canBuy}}
                                                    <span class="text-green font-weight-bold">on sale</span>
                                                {{else if soldOut}}
                                                    <span class="text-blue font-weight-bold">sold out</span>
                                                {{else if saleEnded}}
                                                    <span>sale ended</span>
                                                {{else}}
                                                    <span>active</span>
                                                {{/if}}
                                            </td>
                                            <td class="mdc-data-table__cell font-weight-bold">{{name}}</td>
                                            <td class="mdc-data-table__cell pr-0">{{start.dayOfWeek}}, </td>
                                            <td class="mdc-data-table__cell px-2">{{start.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{start.time}}</td>
                                            <td class="mdc-data-table__cell pr-0">{{end.dayOfWeek}}, </td>
                                            <td class="mdc-data-table__cell px-2">{{end.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{end.time}}</td>
                                            <td class="mdc-data-table__cell text-right font-weight-bold">{{price}}</td>
                                            <td class="mdc-data-table__cell text-right">{{qty}}</td>
                                            <td class="mdc-data-table__cell text-right">{{qtySold}}</td>
                                            <td class="mdc-data-table__cell text-right">{{qtyReserved}}</td>
                                            <td class="mdc-data-table__cell text-right">{{qtyAvailable}}</td>
                                        </tr>
                                        {{/each}}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style="display:none">
                        <div class="mdc-data-table">
                            <div class="mdc-data-table__table-container">
                                <table class="mdc-data-table__table">
                                    <thead>
                                        <tr class="mdc-data-table__header-row">
                                            <th class="mdc-data-table__header-cell text-center">Name</th>
                                            <th class="mdc-data-table__header-cell">Email</th>
                                            <th class="mdc-data-table__header-cell">Ticket</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Sale Date</th>
                                        </tr>
                                    </thead>
                                    <tbody class="mdc-data-table__content">
                                        {{#each event.sold}}
                                        <tr class="mdc-data-table__row{{#if inactive}} text-disabled{{/if}}">
                                            <td class="mdc-data-table__cell font-weight-bold">{{name}}</td>
                                            <td class="mdc-data-table__cell">{{email}}</td>
                                            <td class="mdc-data-table__cell">{{ticketType}}</td>
                                            <td class="mdc-data-table__cell pr-0">{{orderDate.dayOfWeek}}, </td>
                                            <td class="mdc-data-table__cell px-2">{{orderDate.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{orderDate.time}}</td>
                                        </tr>
                                        {{/each}}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style="display:none">
                        <div class="mdc-data-table">
                            <div class="mdc-data-table__table-container">
                                <table class="mdc-data-table__table">
                                    <thead>
                                        <tr class="mdc-data-table__header-row">
                                            <th class="mdc-data-table__header-cell text-center">Status</th>
                                            <th class="mdc-data-table__header-cell">Email</th>
                                            <th class="mdc-data-table__header-cell">Ticket</th>
                                            <th class="mdc-data-table__header-cell">Assigned Name</th>
                                            <th class="mdc-data-table__header-cell">Assigned Email</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Issue Date</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Expiration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody class="mdc-data-table__content">
                                        {{#each event.reserved}}
                                        <tr class="mdc-data-table__row{{#if inactive}} text-disabled{{/if}}">
                                            <td class="mdc-data-table__cell text-center">
                                                {{#if sold}}
                                                    <span class="text-green">sold</span>
                                                {{else if assigned}}
                                                    <span class="">claimed</span>
                                                {{else}}
                                                    <span class="text-red">unclaimed</span>
                                                {{/if}}
                                            </td>
                                            <td class="mdc-data-table__cell">{{email}}</td>
                                            <td class="mdc-data-table__cell">{{ticketType}}</td>
                                            <td class="mdc-data-table__cell">{{assignedName}}</td>
                                            <td class="mdc-data-table__cell">{{assignedEmail}}</td>
                                            <td class="mdc-data-table__cell pr-0">{{issueDate.dayOfWeek}}, </td>
                                            <td class="mdc-data-table__cell px-2">{{issueDate.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{issueDate.time}}</td>
                                            <td class="mdc-data-table__cell pr-0">{{#if expirationDate}}{{expirationDate.dayOfWeek}}, {{/if}}</td>
                                            <td class="mdc-data-table__cell px-2">{{expirationDate.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{expirationDate.time}}</td>
                                        </tr>
                                        {{/each}}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            {{else}}
                <h1>Available Tickets</h1>
                {{#if event.noneAvailable}}<h3 class="text-blue">No tickets available for this event yet</h3>{{/if}}
                {{#if event.saleEnded}}<h3 class="text-blue">Ticket sales ended</h3>{{/if}}
                {{#if event.availableOn}}<h3 class="text-blue">Tickets go on sale {{event.availableOn}}</h3>{{/if}}
                {{#if event.additionalAvailableOn}}<h3 class="text-blue">Additional tickets on sale {{event.additionalAvailableOn}}</h3>{{/if}}
                {{#each event.currentTickets}}
                    <div class="app-ticket mdc-card mdc-card--outlined ma-2{{#if soldOut}} text-medium-emphasis{{/if}}">
                        <div {{#if canBuy}}class="mdc-card__primary-action"{{/if}}>
                        {{#if canBuy}}<a href="./purchase?ticketId={{id}}" class="mdc-theme--on-surface">{{/if}}
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
                                        {{#if showQtyAvailable}}<div class="text-red font-weight-bold text-uppercase mt-2">only {{qtyAvailable}} left</div>{{/if}}
                                    </div>
                                    
                                </div>
                                <div class="pa-4">{{description}}</div>
                            </div>
                            <div class="mdc-card__ripple"></div>
                        {{#if canBuy}}</a>{{/if}}
                        </div>
                    </div>
                {{/each}}
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
        const mainTabs = [
            {title: 'Tickets'},
            {title: 'Tickets Sold'},
            {title: 'Reserved Tickets'}
        ]
        mainTabs[this.activeTab].active = true
        const activeTab = {}
        activeTab['tab' + this.activeTab] = true
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            mainTabs: mainTabs,
            activeTab: activeTab,
            fetch: this.fetch,
            event: this.getEventData(this.event?.data)
        }
    }
    getEventData(eventData) {
        if (!eventData) return undefined

        const dateOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }

        const now = new Date()
        const startDate = new Date(eventData.start_date.slice(0,-1))
        const endDate = new Date(eventData.end_date.slice(0,-1))
        let daysUntil = 0
        if (startDate > new Date()) {
            daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24)).toLocaleString()
        }

        const event = {
            id: eventData.id,
            name: eventData.name,
            location: eventData.location,
            deleted: eventData.deleted_at,
            inactive: !eventData.active,
            startDate: startDate.toLocaleString(undefined, dateOptions),
            endDate: endDate.toLocaleString(undefined, dateOptions),
            ended: endDate < now,
            happeningNow: startDate <= now && endDate >= now,
            daysUntil: daysUntil,
        }

        if (session.getRoles().admin) {
            event.tickets = _.sortBy(TicketType.getTicketData(eventData.ticket_types), ['startDate', 'name'])
            event.tickets.forEach(ticket => {
                ticket.start = this.getDateData(ticket.startDate)
                ticket.end = this.getDateData(ticket.endDate)
            })
            event.sold = _.orderBy(TicketType.getPurchasedTicketData(eventData.purchased_tickets, eventData.ticket_types), 'orderDate', 'desc')
            event.sold.forEach(ticket => {
                ticket.orderDate = this.getDateData(ticket.orderDate)
            })
            event.reserved = _.orderBy(TicketType.getReservedTicketData(eventData.reserved_tickets, eventData.ticket_types), 'issueDate', 'desc')
            event.reserved.forEach(ticket => {
                ticket.issueDate = this.getDateData(ticket.issueDate)
                if (ticket.expirationDate) {
                    ticket.expirationDate = this.getDateData(ticket.expirationDate)
                }
            })

        } else {
            const dateTimeOptions = {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }
            const tickets = TicketType.getTicketData(eventData.ticket_types)
            const pastTickets = _.filter(tickets, ticket => {
                return !ticket.inactive && !ticket.reserved && ticket.saleEnded
            })
            const availableTickets = _.filter(tickets, ticket => {
                return !ticket.inactive && !ticket.reserved && ticket.canBuy
            })
            const currentSoldOut = _.filter(tickets, ticket => {
                return !ticket.inactive && !ticket.reserved && ticket.soldOut
            })
            const futureTickets = _.filter(tickets, ticket => {
                return !ticket.inactive && !ticket.reserved && ticket.availableOn
            })
            event.currentTickets = availableTickets.concat(currentSoldOut)
            
            if (pastTickets.length && !event.currentTickets.length) {
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
            if (!pastTickets.length && !event.currentTickets.length && !futureTickets.length) {
                event.noneAvailable = true
            }    
        }
        return event
    }
    getDateData(date) {
        return {
            dayOfWeek: date.toLocaleString(undefined, {weekday:'short'}),
            date: date.toLocaleString(undefined, {dateStyle:'medium'}),
            time: date.toLocaleString(undefined, {timeStyle:'short'})
        }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        const tabPages = this.querySelector('.tab-pages')
        if (tabPages?.children) {
            tabPages.children[this.activeTab].style.display = 'block'
        }
        const tabBar = this.querySelector('.main-tab-bar')
        if (tabBar) {
            tabBar.addEventListener('activeTab', event => {
                this.activeTab = event.detail.index
                this.refresh()
            })    
        }

        if (!session.loaded) {
            return 
        }
        if (!this.event || this.event.meId != session.me?.id) {
            this.fetch.done = false
            this.event = {
                meId: session.me?.id,
            }
            this.refresh()
            const id = new URLSearchParams(window.location.search).get('id');
            const options = {}
            if (session.getRoles().admin) {
                options.include = 'ticketTypes,purchasedTickets,purchasedTickets.user,reservedTickets,reservedTickets.user'
            } else {
                options.include = 'ticketTypes'
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

            if (session.getRoles().admin && response.ok) {
                /*
                const params = {
                    with_trashed: true,
                    filters: [
                        { field: 'event_id', operator: '=', value: id },
                    ],
                    //sort: [{field: 'start_date', direction: 'asc'}]
                }
                response = await TicketTypeApi.getTicketTypes(id)
                */
                //this.event.data.ticket_types = 
            }

            this.refresh()
        }
    }

    refreshCallback = undefined
    activeTab = 0
    fetch = {}
    event = undefined
}
customElements.define('page-event', PageEvent)