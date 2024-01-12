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
            <h1>Do It</h1>
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}`

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
    get templateData() {
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            fetch: this.fetch,
            event: this.getEventData(this.event?.data)
        }
    }
    getEventData(eventData) {
        if (!eventData) return undefined
        return {}
    }
    async refresh() {
        const reserved = new URLSearchParams(window.location.search).has('reserved')
        if (reserved) {
            const alert = document.querySelector('.reserved-tickets-alert')
            if (alert) {
                alert.style.display = 'none'
            }
        }
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        if (!session.loaded) {
            return 
        }
        const eventId = new URLSearchParams(window.location.search).get('event-id')
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

    refreshCallback = undefined
    fetch = {}
    event = undefined
}
customElements.define('page-shop', PageShop)