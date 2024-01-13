import DateTime from '../model/DateTime.js'
import { session } from '../model/Session.js'
import TicketType from '../model/TicketType.js'
import CartApi from '../api/CartApi.js'
import EventApi from '../api/EventApi.js'
import { MessageDialog } from './dialog/MessageDialog.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
<style>
    .cart-list .cart-item:hover {
        background-color: #FAFAFA;
    }
</style>
{{#if ready}}
{{#if fetch.done}}
    {{#if fetch.error}}
        <h2 class="text-red pa-4 mt-0"><i class="material-icons mr-4">error_outline</i>
            {{#if fetch.notFound}}
            Not Found
            {{else if fetch.notAuthorized}}
            Not Authorized
            {{else}}
            {{fetch.error}} [{{fetch.status}}]
            {{/if}}
        </h2>
    {{else}}
        <div class="d-flex w-100 fill-height">
            {{#unless signedin}}
            <div 
                class="w-100 fill-height d-flex align-center justify-center" 
                style="position:absolute;z-index:4;top:0;left:0;background-color:rgb(0,0,0,.3);">
                <div 
                    class="d-flex align-center justify-center bg-white rounded-lg" 
                    style="width:60%;height:30%;max-width:40rem;max-height:30rem;box-shadow: 0px 0px 30px 0px rgba(0,0,0,.6)">
                    <div class="d-flex flex-column align-center">
                        <h3>Sign in to buy tickets</h3>
                        <button class="signin-button mdc-button mdc-button--unelevated bg-green text-white mb-6" style="width:12rem">
                            <span class="mdc-button__ripple"></span>Sign In
                        </button>
                    </div>
                </div>
            </div>
            {{/unless}}
            <div class="d-flex flex-column w-100 fill-height mx-4">
                <div class="py-4">
                    <h1 class="my-0 mr-2 text-truncate">{{event.name}}</h1>
                    {{#if event.location}}<h3 class="mt-2 text-truncate">{{event.location}}</h3>{{/if}}
                    <div class="text-truncate">{{event.startDate}} - {{event.endDate}}</div>
                    <div class="d-flex align-center my-2">
                        <i class="material-icons text-blue mr-2">history</i>
                        {{#if event.ended}}<span>This event has ended</span>{{/if}}
                        {{#if event.happeningNow}}<span>Happening now!</span>{{/if}}
                        {{#if event.daysUntil}}<span>{{event.daysUntil}} days until event</span>{{/if}}
                    </div>

                    {{#if cartTotalItemsOrderLimit}}
                        <div class="d-flex align-center text-blue">
                            <i class="material-icons icon-medium vertical-align-middle mr-4">info</i>
                            <h3 class="font-weight-normal my-0">
                                There is a {{cartTotalItemsOrderLimit}} ticket limit for this event
                            </h3>
                        </div>
                    {{/if}}

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
                </div>

                <div class="flex-grow-1 overflow-y-auto pr-4 pb-4">
                    {{#unless event.ended}}       
                        {{#if event.noneAvailable}}<h3 class="text-blue">No tickets available for this event yet</h3>{{/if}}
                        {{#if event.saleEnded}}<h3 class="text-blue">Ticket sales ended</h3>{{/if}}
                        {{#if event.availableOn}}<h3 class="text-blue">Tickets go on sale {{event.availableOn}}</h3>{{/if}}
                        {{#if event.additionalAvailableOn}}<h3 class="text-blue">Additional tickets on sale {{event.additionalAvailableOn}}</h3>{{/if}}
                        {{#each event.currentTickets}}
                            {{#unless soldOut}}
                                <div class="app-ticket mdc-card mdc-card--outlined ma-2" data-ticket-type-id="{{id}}">
                                    <div class="d-flex flex-column">
                                        <div class="d-flex b-border pa-4">
                                            <div class="d-flex flex-column mr-auto">
                                                <h2 class="text-blue mt-0 mb-2">{{name}}</h2>
                                                <div>
                                                    {{#if saleEnded}}Sale ended {{saleEnded}}
                                                    {{else if availableOn}}<span class="text-blue">Available on {{availableOn}}</span>
                                                    {{else if soldOut}}<span class="text-red">Sold out</span>
                                                    {{else}}{{#if showQtyAvailable}}<span class="font-weight-bold">{{qtyAvailable}} available</span>{{/if}}
                                                    {{/if}}
                                                </div>
                                            </div>
                                            <div class="d-flex flex-column align-end">
                                                <h2 class="my-0 pb-2">{{price}}</h2>
                                                <div class="d-flex align-center">
                                                    <button type="button" 
                                                        class="remove-ticket-button mdc-button mdc-button--unelevated bg-grey-lighten-3 px-0 mr-2"
                                                        style="min-width:36px;{{#unless qtyCart}}opacity:.3{{/unless}}"
                                                    >
                                                        <div class="mdc-button__ripple"></div>
                                                        <span class="mdc-button__label text-black"><i class="material-icons">remove</i></span>
                                                    </button>
                                                    <div class="cart-quantity font-weight-bold px-4" style="font-size:130%">{{qtyCart}}</div>
                                                    <button type="button" 
                                                        class="add-ticket-button mdc-button mdc-button--unelevated bg-grey-lighten-3 px-0 ml-2"
                                                        style="min-width:36px;{{#unless qtyCartAvailable}}opacity:.3{{/unless}}"
                                                    >
                                                        <div class="mdc-button__ripple"></div>
                                                        <span class="mdc-button__label text-black"><i class="material-icons">add</i></span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div class="pa-4">{{description}}</div>
                                    </div>
                                </div>
                            {{/unless}}
                        {{/each}}
                    {{/unless}}
                </div>
            </div>
            <div 
                class="cart-info d-flex flex-column l-border" 
                style="width:32%;min-width:15rem;max-width:30rem;box-shadow:0px 0px 16px 0px rgba(0,0,0,.2)">
                <h3 class="my-0 pa-4 text-center bg-grey-lighten-3 b-border">Your Order</h3>
                <div class="cart-list flex-grow-1 flex-shrink-1 overflow-y-auto" style="min-height:1rem"></div>
                <div class="d-flex flex-column align-center py-4">
                    <h2 class="cart-total-amount">$0.00</h2>
                    <button type="button" class="buy-button disabled mdc-button mdc-button--unelevated" style="min-width:12rem">
                        <div class="mdc-button__ripple"></div>
                        <span class="mdc-button__label">Checkout</span>
                    </button>
                </div>
            </div>
        </div>
    {{/if}}
{{else}}
    <div class="d-flex justify-center pa-4">
        <mdc-circular-progress indeterminate></mdc-circular-progress>
    </div>
{{/if}}
{{/if}}`

const cartListTemplate = `
{{#each this}}
<div class="cart-item d-flex align-center px-4 py-2">
    <div class="mr-auto">
        <h3 class="my-0">{{name}}</h3>
        <div class="mt-2">{{quantity}} × {{price}}</div>
    </div>
    <div class="ml-2">
        <button 
            class="remove-tickets-button mdc-icon-button material-icons text-grey-darken-2 pa-0" 
            style="width:40px;height:40px;"
            data-ticket-type-id="{{id}}"
        >
            <div class="mdc-icon-button__ripple"></div>
            delete_outline
        </button>
    </div>
</div>
{{/each}}`

const perItemOrderLimit = undefined
const cartTotalItemsOrderLimit = 6

export class PageShop extends HTMLElement {
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
    get isReservedMode() {
        return new URLSearchParams(window.location.search).has('reserved')
    }
    get eventId() {
        return new URLSearchParams(window.location.search).get('event-id')
    }
    get templateData() {
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            fetch: this.fetch,
            event: this.getEventData(this.event?.data),
            cartTotalItemsOrderLimit: this.isReservedMode ? undefined : cartTotalItemsOrderLimit
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
        const startDate = DateTime.parseISOLocalToDate(eventData.start_date)
        const endDate = DateTime.parseISOLocalToDate(eventData.end_date)
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

        let ticketTypes = eventData.ticket_types

        if (this.isReservedMode) {
            // TODO: How to handle if a reserved ticket is in a cart already to determine available quantity.
            const reservedQtyByTicketType = _.chain(session.me?.reserved_tickets)
                .filter(ticket => {
                    const saleStartDate = new Date(ticket.ticket_type.sale_start_date)
                    const saleEndDate = new Date(ticket.expiration_date || ticket.ticket_type.sale_end_date)
                    return ticket.ticket_type.active && !ticket.is_purchased && saleStartDate < now && saleEndDate > now
                })
                .map(ticket => {
                    return {
                        ticket_type_id: ticket.ticket_type_id
                    }
                })
                .countBy('ticket_type_id')
                .value()
            ticketTypes = _.map(reservedQtyByTicketType, (quantity, id) => {
                const ticketType = _.find(eventData.ticket_types, {id: parseInt(id)})
                ticketType.quantity = quantity
                ticketType.purchased_tickets_count = 0
                ticketType.reserved_tickets_count = 0 // TODO: We need the 
                ticketType.cart_items_quantity = 0 // TODO: We need the 
                return ticketType
            })
            //console.log(session.me?.reserved_tickets)
            //console.log(reservedQtyByTicketType)
        }

        const tickets = TicketType.getTicketData(ticketTypes)
        tickets.forEach(ticket => {
            ticket.qtyCart = _.find(this.cartItems, {id: ticket.id})?.quantity || 0
            ticket.qtyCartAvailable = ticket.qtyAvailable - ticket.qtyCart
            ticket.showQtyAvailable = true
        })
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
    refreshTickets() {
        this.querySelectorAll('.app-ticket').forEach(element => {
            const ticketTypeId = parseInt(element.dataset.ticketTypeId)
            const itemInfo = this.getItemInfo(ticketTypeId)
            element.querySelector('.remove-ticket-button').style.opacity = itemInfo.quantity ? '1' : '.3'
            element.querySelector('.add-ticket-button').style.opacity = itemInfo.quantity < itemInfo.available ? '1' : '.3'
            element.querySelector('.cart-quantity').textContent = itemInfo.quantity
        })
        const cartTotalPrice = _.reduce(this.cartItems, (total, item) => {
            const ticketType = _.find(this.event.data.ticket_types, {id: item.id})
            return total + item.quantity * ticketType.price
        }, 0)
        const cartTotalPriceElement = this.querySelector('.cart-total-amount')
        if (cartTotalPriceElement) {
            cartTotalPriceElement.textContent = '$' + cartTotalPrice.toFixed(2)
        }
        const buyButton = this.querySelector('.buy-button')
        if (buyButton) {
            buyButton.disabled = this.cartItems.length == 0
        }
        const cartList = this.querySelector('.cart-list')
        if (cartList) {
            const cartData = _.map(this.cartItems, item => {
                const ticketType = _.find(this.event.data.ticket_types, {id: item.id})
                return {
                    id: ticketType.id,
                    name: ticketType.name,
                    price: '$' + ticketType.price.toFixed(2),
                    quantity: item.quantity
                }
            })
            cartList.innerHTML = Handlebars.compile(cartListTemplate)(cartData)
            this.querySelectorAll('.remove-tickets-button').forEach(element => {
                element.addEventListener('click', event => {
                    const ticketTypeId = parseInt(event.currentTarget.dataset.ticketTypeId)
                    if (!ticketTypeId) {
                        return
                    }
                    _.remove(this.cartItems, item => {
                        return item.id == ticketTypeId
                    })
                    this.refreshTickets()
                })
            })
        }
    }
    getItemInfo(ticketTypeId) {
        const ticketType = _.find(this.event.data.ticket_types, {id: ticketTypeId})
        const item = _.find(this.cartItems, {id: ticketTypeId})
        const info = {
            item: item,
            quantity: item?.quantity || 0,
            available: ticketType.quantity - ticketType.purchased_tickets_count - ticketType.cart_items_quantity
        }
        if (!this.isReservedMode) {
            if (info.available > perItemOrderLimit) {
                info.available = perItemOrderLimit
            }
            const cartTotalQuantity = _.reduce(this.cartItems, (total, item) => {
                return total + item.quantity
            }, 0)
            if (cartTotalQuantity == cartTotalItemsOrderLimit) {
                info.available = 0
            }
        }
        return info
    }
    async refresh() {
        if (this.isReservedMode) {
            const alert = document.querySelector('.reserved-tickets-alert')
            if (alert) {
                alert.style.display = 'none'
            }
        }
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        if (!session.loaded) {
            return 
        }
        this.refreshTickets()

        this.querySelector('.signin-button')?.addEventListener('click', () => {
            document.querySelector('app-bar').openSigninDialog()
        })

        this.querySelectorAll('.remove-ticket-button').forEach(element => {
            element.addEventListener('click', event => {
                const ticketTypeId = parseInt(event.currentTarget.closest('.app-ticket').dataset.ticketTypeId)
                if (!ticketTypeId) {
                    return
                }
                const itemInfo = this.getItemInfo(ticketTypeId)
                if (itemInfo.item) {
                    itemInfo.item.quantity--
                    if (itemInfo.item.quantity == 0) {
                        _.remove(this.cartItems, item => {
                            return item.id == ticketTypeId
                        })
                    }
                }
                this.refreshTickets()
            })
        })
        this.querySelectorAll('.add-ticket-button').forEach(element => {
            element.addEventListener('click', event => {
                const ticketTypeId = parseInt(event.currentTarget.closest('.app-ticket').dataset.ticketTypeId)
                if (!ticketTypeId) {
                    return
                }
                const itemInfo = this.getItemInfo(ticketTypeId)
                if (itemInfo.quantity < itemInfo.available) {
                    if (itemInfo.item) {
                        itemInfo.item.quantity++
                    } else {
                        this.cartItems.push({id: ticketTypeId, quantity: 1})
                    }    
                }
                this.refreshTickets()
            })
        })
        this.querySelector('.buy-button')?.addEventListener('click', async () => {
            await this.createCheckoutCart()
        })
        
        const eventId = this.eventId
        if (!eventId) {
            this.fetch = {
                done: true,
                error: 'Event Not Specified',
                status: 500
            }
            this.innerHTML = Handlebars.compile(template)(this.templateData)
            return
        }

        if (!this.event) {
            this.event = {}
            this.fetch.done = false
            this.refresh()
            const id = eventId
            const options = {
                include: 'ticketTypes'
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
    async createCheckoutCart() {
        const results = await MessageDialog.doRequestWithProcessing('Checking out', async () => {
            const info = {
                reserved: this.isReservedMode,
                tickets: this.cartItems
            }
            return await CartApi.addCart(info)
        })
        console.log(results)
        if (results.ok) {
           
        }
    }

    refreshCallback = undefined
    fetch = {}
    event = undefined
    cartItems = []
}
customElements.define('page-shop', PageShop)