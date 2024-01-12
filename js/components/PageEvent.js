import DateTime from '../model/DateTime.js'
import { session } from '../model/Session.js'
import TicketType from '../model/TicketType.js'
import EventApi from '../api/EventApi.js'
import ReservedTicketApi from '../api/ReservedTicketApi.js'
import TicketTypeApi from '../api/TicketTypeApi.js'
import { AddReservedTicketDialog } from './dialog/AddReservedTicketDialog.js'
import { EditReservedTicketDialog } from './dialog/EditReservedTicketDialog.js'
import { EventDialog } from './dialog/EventDialog.js'
import { MessageDialog } from './dialog/MessageDialog.js'
import { TicketTypeDialog } from './dialog/TicketTypeDialog.js'
import { CircularProgress } from './mdc/CircularProgress.js'
import { TabBar } from './mdc/TabBar.js'
import { Tab } from './mdc/Tab.js'
import ReservedTicket from '../model/ReservedTicket.js'

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
                <h1 class="my-0 mr-2 text-truncate">{{event.name}}</h1>
                <div class="mr-auto">
                    {{#if event.deleted}}
                        <span class="chip text-white bg-red ml-2">deleted</span>
                    {{else if event.inactive}}
                        <span class="chip text-white bg-grey ml-2">inactive</span>
                    {{/if}}
                </div>
                {{#if roles.admin}}
                    <button type="button" class="edit-button mdc-button mdc-button--unelevated ml-2">
                        <div class="mdc-button__ripple"></div>
                        <span class="mdc-button__label">Edit</span>
                    </button>
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

            {{#if event.purchased.count}}
                <div class="d-flex align-center text-green py-4">
                    <i class="material-icons icon-medium vertical-align-middle mr-4">local_activity</i>
                    <h3 class="font-weight-normal my-0">
                    {{#if event.purchased.multiple}}
                        You have {{event.purchased.count}} tickets for this event
                    {{else}}
                        You have 1 ticket for this event
                    {{/if}}
                    </h3>
                    <div class="ml-6 flex-shrink-0">
                        <button class="mdc-button mdc-button--unelevated bg-green text-white">
                            <a href="./tickets" class="text-white">    
                                <span class="mdc-button__ripple"></span>Show Tickets
                            </a>
                        </button>
                    </div>
                </div>
            {{/if}}

            {{#if roles.admin}}
                <mdc-tab-bar class="main-tab-bar">
                    {{#each mainTabs}}
                        <mdc-tab {{#if active}}active {{/if}}title="{{title}}"></mdc-tab>
                    {{/each}}
                </mdc-tab-bar>
                <div class="tab-pages my-4">
                    <div style="display:none">
                        <div class="mb-2">
                            <button type="button" class="add-ticket-type-button mdc-button mdc-button--unelevated bg-grey text-white mr-2">
                                <div class="mdc-button__ripple"></div>
                                <span class="mdc-button__label">Add Ticket</span>
                            </button>
                        </div>
                        <div class="ticket-type-list mdc-data-table">
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
                                        {{#each event.ticketGroups}}
                                            {{#if inactive}}
                                                <tr class="mdc-data-table__row">
                                                    <td colspan="13" class="font-weight-bold text-center b-border pt-6 pb-2">Inactive Tickets</td>
                                                </tr>
                                            {{/if}}
                                            {{#each tickets}}
                                            <tr class="mdc-data-table__row{{#if inactive}} text-disabled{{/if}}" data-ticket-type-id="{{id}}">
                                                <td class="mdc-data-table__cell text-center">
                                                    {{#if deleted}}
                                                        <span class="text-red">deleted</span>
                                                    {{else if inactive}}
                                                        <span class="">inactive</span>
                                                    {{else if qty}}
                                                        {{#if canBuy}}
                                                            <span class="text-green font-weight-bold">on sale</span>
                                                        {{else if soldOut}}
                                                            <span class="text-blue font-weight-bold">sold out</span>
                                                        {{else if saleEnded}}
                                                            <span>sale ended</span>
                                                        {{else}}
                                                            <span>active</span>
                                                        {{/if}}
                                                    {{else}}
                                                        {{#if saleEnded}}
                                                            <span>expired</span>
                                                        {{else}}
                                                            <span class="text-green font-weight-bold">available</span>
                                                        {{/if}}
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
                                        {{/each}}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style="display:none">
                        <div class="sold-ticket-list mdc-data-table">
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
                        <div class="mb-2">
                            <button type="button" class="add-reserved-ticket-button mdc-button mdc-button--unelevated bg-grey text-white mr-2">
                                <div class="mdc-button__ripple"></div>
                                <span class="mdc-button__label">Add Reserved Tickets</span>
                            </button>
                        </div>
                        <div class="reserved-ticket-list mdc-data-table">
                            <div class="mdc-data-table__table-container">
                                <table class="mdc-data-table__table">
                                    <thead>
                                        <tr class="mdc-data-table__header-row">
                                            <th class="mdc-data-table__header-cell text-center">Status</th>
                                            <th class="mdc-data-table__header-cell">Email</th>
                                            <th class="mdc-data-table__header-cell">Ticket</th>
                                            <th class="mdc-data-table__header-cell">Assigned To</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Issue Date</th>
                                            <th class="mdc-data-table__header-cell" colspan="3">Offer Ends</th>
                                        </tr>
                                    </thead>
                                    <tbody class="mdc-data-table__content">
                                        {{#each event.reserved}}
                                        <tr class="mdc-data-table__row{{#if saleEnded}} text-disabled{{/if}}" data-reserved-ticket-id="{{id}}">
                                            <td class="mdc-data-table__cell text-center">
                                                {{#if sold}}
                                                    <span class="text-green">sold</span>
                                                {{else if saleEnded}}
                                                    <span>expired</span>
                                                {{else}}
                                                    {{#if ticketInactive}}
                                                        <span class="text-grey">inactive</span>
                                                    {{else if assigned}}
                                                        <span>claimed</span>
                                                    {{else}}
                                                        <span class="text-red">unclaimed</span>
                                                    {{/if}}
                                                {{/if}}
                                            </td>
                                            <td class="mdc-data-table__cell">{{email}}</td>
                                            <td class="mdc-data-table__cell">{{ticketType}}</td>
                                            <td class="mdc-data-table__cell">
                                                <span class="font-weight-bold">{{assignedName}}</span>{{#if assignedEmail}} &lt;{{assignedEmail}}&gt;{{/if}}
                                            </td>
                                            <td class="mdc-data-table__cell pr-0">{{issued.dayOfWeek}}, </td>
                                            <td class="mdc-data-table__cell px-2">{{issued.date}}</td>
                                            <td class="mdc-data-table__cell pl-0">{{issued.time}}</td>
                                            {{#if sold}}
                                                <td class="mdc-data-table__cell" colspan="3"></td>
                                            {{else}}
                                                <td class="mdc-data-table__cell pr-0">{{saleEnd.dayOfWeek}}, </td>
                                                <td class="mdc-data-table__cell px-2">{{saleEnd.date}}</td>
                                                <td class="mdc-data-table__cell pl-0">{{saleEnd.time}}</td>
                                            {{/if}}
                                        </tr>
                                        {{/each}}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            {{else}}
                {{#unless event.ended}}
                {{#if event.reserved.count}}
                    <h2>Reserved Tickets</h2>
                    {{#each event.reserved.tickets}}
                        <div class="app-ticket mdc-card mdc-card--outlined ma-2{{#if soldOut}} text-medium-emphasis{{/if}}">
                            <div {{#if canBuy}}class="mdc-card__primary-action"{{/if}}>
                            {{#if canBuy}}<a href="./purchase?ticketId={{id}}" class="mdc-theme--on-surface">{{/if}}
                                <div class="d-flex flex-column">
                                    <div class="d-flex b-border pa-4">
                                        <div class="d-flex flex-column mr-auto">
                                            <h2 class="text-blue mt-0 mb-2">{{name}}</h2>
                                            <div>
                                                {{#if saleEnded}}Sale ended {{saleEnded}}
                                                {{else if availableOn}}<span class="text-blue">Available on {{availableOn}}</span>
                                                {{else if soldOut}}<span class="text-red">Sold out</span>
                                                {{else}}{{timeRemaining}}
                                                {{/if}}
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column align-end">
                                            <h2 class="my-0">{{#unless soldOut}}{{price}}{{/unless}}</h2>
                                            {{#if showQtyAvailable}}<div class="text-medium-emphasis">{{qtyAvailable}} available</div>
                                            {{else if showSoldOutSoon}}<div class="text-red font-weight-bold text-uppercase mt-2">only {{qtyAvailable}} left</div>
                                            {{/if}}
                                        </div>
                                        
                                    </div>
                                    <div class="pa-4">{{description}}</div>
                                </div>
                                <div class="mdc-card__ripple"></div>
                            {{#if canBuy}}</a>{{/if}}
                            </div>
                        </div>
                    {{/each}}
                    <div class="b-border my-8"></div>
                {{/if}}

                <h2>{{#if event.reserved.count}}General Availability Tickets{{else}}Available Tickets{{/if}}</h2>
                {{#if event.noneAvailable}}<h3 class="text-blue">No tickets available for this event yet</h3>{{/if}}
                {{#if event.saleEnded}}<h3 class="text-blue">Ticket sales ended</h3>{{/if}}
                {{#if event.availableOn}}<h3 class="text-blue">Tickets go on sale {{event.availableOn}}</h3>{{/if}}
                {{#if event.additionalAvailableOn}}<h3 class="text-blue">Additional tickets on sale {{event.additionalAvailableOn}}</h3>{{/if}}
                {{#each event.currentTickets}}
                    <div class="app-ticket mdc-card mdc-card--outlined ma-2{{#if soldOut}} text-medium-emphasis{{/if}}">
                        <div {{#if canBuy}}class="mdc-card__primary-action"{{/if}}>
                        {{#if canBuy}}<a href="./purchase?ticketId={{id}}" class="mdc-theme--on-surface">{{/if}}
                            <div class="d-flex flex-column">
                                <div class="d-flex b-border pa-4">
                                    <div class="d-flex flex-column mr-auto">
                                        <h2 class="text-blue mt-0 mb-2">{{name}}</h2>
                                        <div>
                                            {{#if saleEnded}}Sale ended {{saleEnded}}
                                            {{else if availableOn}}<span class="text-blue">Available on {{availableOn}}</span>
                                            {{else if soldOut}}<span class="text-red">Sold out</span>
                                            {{else}}{{timeRemaining}}
                                            {{/if}}
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column align-end">
                                        <h2 class="my-0">{{#unless soldOut}}{{price}}{{/unless}}</h2>
                                        {{#if showQtyAvailable}}<div class="text-medium-emphasis">{{qtyAvailable}} available</div>
                                        {{else if showSoldOutSoon}}<div class="text-red font-weight-bold text-uppercase mt-2">only {{qtyAvailable}} left</div>
                                        {{/if}}
                                    </div>
                                    
                                </div>
                                <div class="pa-4">{{description}}</div>
                            </div>
                            <div class="mdc-card__ripple"></div>
                        {{#if canBuy}}</a>{{/if}}
                        </div>
                    </div>
                {{/each}}
                {{/unless}}
            {{/if}}
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
<event-dialog></event-dialog>
<ticket-type-dialog></ticket-type-dialog>
<add-reserved-ticket-dialog></add-reserved-ticket-dialog>
<edit-reserved-ticket-dialog></edit-reserved-ticket-dialog>
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
            daysUntil: daysUntil
        }

        event.purchased = this.getMyPurchasedData(event)
        event.reserved = this.getMyReservedTicketData(event)

        if (session.getRoles().admin) {
            const tickets = _.sortBy(TicketType.getTicketData(eventData.ticket_types), ['startDate', 'name'])
            tickets.forEach(ticket => {
                ticket.start = DateTime.getDateData(ticket.startDate)
                ticket.end = DateTime.getDateData(ticket.endDate)
            })
            event.ticketGroups = [
                {inactive: false, tickets: _.filter(tickets, ticket => !ticket.inactive)},
                {inactive: true, tickets: _.filter(tickets, ticket => ticket.inactive)}
            ]
            event.sold = _.orderBy(TicketType.getPurchasedTicketData(eventData.purchased_tickets, eventData.ticket_types), 'orderDate', 'desc')
            event.sold.forEach(ticket => {
                ticket.orderDate = DateTime.getDateData(ticket.orderDate)
            })
            event.reserved = _.sortBy(TicketType.getReservedTicketData(eventData.reserved_tickets, eventData.ticket_types), 'email')
            event.reserved.forEach(ticket => {
                ticket.issued = DateTime.getDateData(ticket.issueDate)
                ticket.saleEnd = DateTime.getDateData(ticket.expirationDate || ticket.saleEndDate)
                ticket.saleEnded = (ticket.expirationDate || ticket.saleEndDate) < now
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
    getMyPurchasedData(event) {
        if (event.ended) {
            return {count:0}
        }
        const purchasedCount = _.chain(session.me?.purchased_tickets)
            .filter(ticket => {
                return ticket.ticket_type.event_id == event.id
            })
            .value()
            .length
        return {
            count: purchasedCount,
            multiple: purchasedCount > 1
        }
    }
    getMyReservedTicketData(event) {
        if (event.ended) {
            return {count:0}
        }

        const now = new Date()
        const availableReserved = _.chain(session.me?.reserved_tickets)
            .filter(ticket => {
                const saleStartDate = new Date(ticket.ticket_type.sale_start_date)
                const saleEndDate = new Date(ticket.expiration_date || ticket.ticket_type.sale_end_date)
                return ticket.ticket_type.active && !ticket.purchased_ticket_id && saleStartDate < now && saleEndDate > now
            })
            .map(ticket => { 
                // Adjust the end date if the reserved ticket has an expiration date
                const saleEndDate = ticket.expiration_date || ticket.ticket_type.sale_end_date
                return Object.assign(_.cloneDeep(ticket.ticket_type), {
                    sale_end_date: saleEndDate,
                    groupKey: `${ticket.ticket_type.id}:${saleEndDate}`
                })
            })
            .value()

        // Group the available tickets by the ticket type and exiration date
        const ticketGroups = _.uniqBy(availableReserved, 'groupKey')
        const countByTypeSaleEndDate = _.countBy(availableReserved, 'groupKey')
        // Set the available quantity to the reserved count per group, and the sold count to zero
        ticketGroups.forEach(ticketGroup => {
            ticketGroup.quantity = countByTypeSaleEndDate[ticketGroup.groupKey]
            ticketGroup.purchased_tickets_count = 0
        })

        const tickets = _.sortBy(TicketType.getTicketData(ticketGroups), ['endDate','name'])
        tickets.forEach(ticket => {
            ticket.showQtyAvailable = true
        })
        
        return {
            tickets: tickets,
            count: availableReserved.length
        }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        if (!session.loaded) {
            return 
        }
        
        this.querySelectorAll('.edit-button').forEach(element => {
            element.addEventListener('click', event => {
                this.openEditEventDialog()
            })
        })
        const eventDialog = this.querySelector('event-dialog')
        eventDialog.addEventListener('save', async (event) => {
            await this.updateEvent(event.detail)
        })
        eventDialog.addEventListener('delete', async (event) => {
            await this.deleteEvent(event.detail.id)
        })
        const tabPages = this.querySelector('.tab-pages')
        if (tabPages?.children) {
            tabPages.children[this.activeTab].style.display = 'block'
        }
        const tabBar = this.querySelector('.main-tab-bar')
        tabBar?.addEventListener('activeTab', event => {
            this.activeTab = event.detail.index
            this.refresh()
        })    
        this.querySelector('.add-ticket-type-button')?.addEventListener('click', event => {
            this.openAddTicketTypeDialog()
        })
        this.querySelectorAll('.ticket-type-list tbody tr').forEach(element => {
            element.addEventListener('click', event => {
                const ticketTypeId = event.currentTarget.dataset.ticketTypeId
                if (ticketTypeId) {
                    this.openEditTicketTypeDialog(parseInt(ticketTypeId))
                }
            })
        })
        const ticketTypeDialog = this.querySelector('ticket-type-dialog')
        ticketTypeDialog.addEventListener('save', async (event) => {
            await this.saveTicketType(event.detail)
        })
        ticketTypeDialog.addEventListener('delete', async (event) => {
            await this.deleteTicketType(event.detail.id)
        })
        this.querySelector('.add-reserved-ticket-button')?.addEventListener('click', event => {
            this.openAddReservedTicketDialog()
        })
        const addReservedTicketDialog = this.querySelector('add-reserved-ticket-dialog')
        addReservedTicketDialog.addEventListener('save', async (event) => {
            await this.addReservedTickets(event.detail.ticket, event.detail.quantity)
        })
        this.querySelectorAll('.reserved-ticket-list tbody tr').forEach(element => {
            element.addEventListener('click', event => {
                const reservedTicketId = event.currentTarget.dataset.reservedTicketId
                if (reservedTicketId) {
                    this.openEditReservedTicketDialog(parseInt(reservedTicketId))
                }
            })
        })
        const editReservedTicketDialog = this.querySelector('edit-reserved-ticket-dialog')
        editReservedTicketDialog.addEventListener('save', async (event) => {
            await this.saveReservedTicket(event.detail)
        })
        editReservedTicketDialog.addEventListener('delete', async (event) => {
            await this.deleteReservedTicket(event.detail.id)
        })

        if (!this.event || this.event.meId != session.me?.id) {
            this.fetch.done = false
            this.event = {
                meId: session.me?.id,
            }
            this.refresh()
            const id = new URLSearchParams(window.location.search).get('id')
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

            this.refresh()
        }
    }
    openEditEventDialog() {
        const dialog = this.querySelector('event-dialog')
        dialog.event = _.cloneDeep(this.event.data)
        dialog.open = true
    }
    openAddTicketTypeDialog() {
        const dialog = this.querySelector('ticket-type-dialog')
        dialog.event = this.event.data
        dialog.ticketType = this.getDefaultTicketType()
        dialog.open = true
    }
    openEditTicketTypeDialog(ticketTypeId) {
        const ticketType = _.find(this.event.data.ticket_types, {id: ticketTypeId})
        const dialog = this.querySelector('ticket-type-dialog')
        dialog.event = this.event.data
        dialog.ticketType = _.cloneDeep(ticketType)
        dialog.open = true
    }
    getDefaultTicketType() {
        const ticket = new TicketType()
        ticket.active = false
        ticket.event_id = this.event.data.id

        const nowIsh = new Date()
        nowIsh.setHours(nowIsh.getHours(), 0, 0, 0)
        const endDate = new Date(this.event.data.start_date)
        endDate.setHours(23, 0, 0, 0)
        ticket.sale_start_date = nowIsh.toISOString()
        ticket.sale_end_date = endDate.toISOString()
        return ticket
    }
    openAddReservedTicketDialog() {
        const ticketTypes = _.sortBy(this.event.data.ticket_types, ['sale_start_date', 'name'])
        if (ticketTypes.length == 0) {
            new MessageDialog().showMessage('Error', 'Add a ticket type first')
            return
        }

        let ticketType = _.find(ticketTypes, {quantity: 0})
        if (!ticketType) {
            ticketType = ticketTypes[0]
        }

        const dialog = this.querySelector('add-reserved-ticket-dialog')
        dialog.eventName = this.event.data.name
        dialog.ticketTypes = TicketType.getTicketData(ticketTypes)
        dialog.reservedTicket = new ReservedTicket()
        dialog.reservedTicket.ticket_type_id = ticketType.id
        dialog.open = true
    }
    openEditReservedTicketDialog(reservedTicketId) {
        const reservedTicket = _.find(this.event.data.reserved_tickets, {id: reservedTicketId})
        const ticketType = _.find(this.event.data.ticket_types, {id: reservedTicket.ticket_type_id})
        const dialog = this.querySelector('edit-reserved-ticket-dialog')
        dialog.eventName = this.event.data.name
        dialog.ticketType = TicketType.getTicketData([ticketType])[0]
        dialog.reservedTicket = _.cloneDeep(reservedTicket)
        dialog.open = true
    }
    async updateEvent(event) {
        const results = await MessageDialog.doRequestWithProcessing('Saving event', async () => {
            return await EventApi.updateEvent(event)
        })
        if (results.ok) {
            Object.assign(this.event.data, results.data.data)
            this.refresh()
        }
    }
    async deleteEvent(eventId) {
        const results = await MessageDialog.doRequestWithProcessing('Deleting event', async () => {
            return await EventApi.deleteEvent(eventId)
        })
        if (results.ok) {
            window.location.href = './events'
        }
    }
    async saveTicketType(ticketType) {
        if (ticketType.id) {
            await this.updateTicketType(ticketType)
        } else {
            await this.addTicketType(ticketType)
        }
    }
    async addTicketType(ticketType) {
        const results = await MessageDialog.doRequestWithProcessing('Adding ticket', async () => {
            return await TicketTypeApi.addTicketType(ticketType)
        })
        if (results.ok) {
            if (!this.event.ticket_types) {
                this.event.ticket_types = []
            }
            this.event.data.ticket_types.push(results.data.data)
            this.refresh()
        }
    }
    async updateTicketType(ticketType) {
        const results = await MessageDialog.doRequestWithProcessing('Saving ticket', async () => {
            return await TicketTypeApi.updateTicketType(ticketType)
        })
        if (results.ok) {
            const ticketType = _.find(this.event.data.ticket_types, {id: results.data.data.id})
            Object.assign(ticketType, results.data.data)
            this.refresh()
        }
    }
    async deleteTicketType(ticketTypeId) {
        const ticketType = _.find(this.event.data.ticket_types, {id: ticketTypeId})
        const results = await MessageDialog.doRequestWithProcessing('Deleting ticket', async () => {
            return await TicketTypeApi.deleteTicketType(ticketType.event_id, ticketTypeId)
        })
        if (results.ok) {
            _.remove(this.event.data.ticket_types, ticket => {
                return ticket.id == ticketTypeId
            })
            this.refresh()
        }
    }
    async addReservedTickets(ticket, quantity) {
        if (quantity < 1) {
            return 
        }
        const tickets = _.times(quantity, () => {
            return ticket
        })
        const results = await MessageDialog.doRequestWithProcessing('Adding tickets', async () => {
            return await ReservedTicketApi.addReservedTickets(tickets)
        })
        if (results.ok) {
            if (!this.event.reserved_tickets) {
                this.event.reserved_tickets = []
            }
            this.event.data.reserved_tickets = this.event.data.reserved_tickets.concat(results.data.data)
            this.refresh()
        }
    }
    async saveReservedTicket(reservedTicket) {
        const results = await MessageDialog.doRequestWithProcessing('Saving ticket', async () => {
            return await ReservedTicketApi.updateReservedTicket(reservedTicket)
        })
        if (results.ok) {
            const reservedTicket = _.find(this.event.data.reserved_tickets, {id: results.data.data.id})
            Object.assign(reservedTicket, results.data.data)
            this.refresh()
        }
    }
    async deleteReservedTicket(reservedTicketId) {
        const reservedTicket = _.find(this.event.data.reserved_tickets, {id: reservedTicketId})
        const results = await MessageDialog.doRequestWithProcessing('Deleting ticket', async () => {
            return await ReservedTicketApi.deleteReservedTicket(reservedTicket.ticket_type_id, reservedTicketId)
        })
        if (results.ok) {
            _.remove(this.event.data.reserved_tickets, ticket => {
                return ticket.id == reservedTicketId
            })
            this.refresh()
        }
    }

    refreshCallback = undefined
    activeTab = 0
    fetch = {}
    event = undefined
}
customElements.define('page-event', PageEvent)