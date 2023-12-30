import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        {{#if fetch.error}}
            <h1 class="mt-0">{{fetch.error}}</h1>
        {{else}}
            <h1 class="mt-0">Events</h1>
            {{#each events}}
                <div class="mdc-card mdc-card--outlined ma-2">
                    <div class="mdc-card__primary-action pa-6">
                    <a href="/event.html?id={{id}}" class="mdc-theme--on-surface">
                        <div class="d-flex align-center">
                            <h2 class="my-0 mr-auto text-truncate">{{name}}</h2>
                            {{#if deleted}}
                                <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">deleted</span>
                            {{else if inactive}}
                                <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">inactive</span>
                            {{/if}}
                        </div>
                        {{#if location}}<h4 class="mt-2 text-truncate">{{location}}</h4>{{/if}}
                        <div class="text-truncate">{{startDate}} - {{endDate}}</div>
                        <div class="mdc-card__ripple"></div>
                    </a>
                    </div>
                </div>
            {{/each}}
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class PageEvents extends HTMLElement {
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
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        }
        const events = _.map(this.events?.data, event => {
            return {
                id: event.id,
                name: event.name,
                location: event.location,
                deleted: event.deleted_at,
                inactive: !event.active,
                startDate: new Date(event.start_date).toLocaleString(undefined, dateOptions),
                endDate: new Date(event.end_date).toLocaleString(undefined, dateOptions)
            }
        })
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            fetch: this.fetch,
            events: events
        }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        if (!session.loaded) {
            return 
        }
        if (!this.events || this.events.meId != session.me?.id) {
            this.fetch.done = false
            this.events = {
                meId: session.me?.id,
            }
            this.refresh()
            const params = {
                //sort: [{field: 'date_start', direction: 'desc'}]
            }
            const response = await EventApi.search(params)
            const data = await response.json()
            this.fetch = {
                done: true,
                status: response.status,
                error: !response.ok ? data.message : '',
                notFound: response.status == 404,
                notAuthorized: [401, 403].includes(response.status)
            }
            this.events.data = response.ok ? data?.data : []
            this.refresh()
        }
    }

    refreshCallback = undefined
    fetch = {}
    events = undefined
}
customElements.define('page-events', PageEvents)