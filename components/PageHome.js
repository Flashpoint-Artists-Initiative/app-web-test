import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        <div class="d-flex">
            <h1 class="mt-0 mr-auto">Upcoming Events</h1>
            {{#if roles.admin}}
                <a href="./events" class="mr-2">
                    <button type="button" class="events-button mdc-button mdc-button--unelevated">
                        <div class="mdc-button__ripple"></div>
                        <span class="mdc-button__label">Events</span>
                    </button>
                </a>
                <a href="./users">
                    <button type="button" class="events-button mdc-button mdc-button--unelevated">
                        <div class="mdc-button__ripple"></div>
                        <span class="mdc-button__label">Users</span>
                    </button>
                </a>
            {{/if}}
        </div>
        {{#if fetch.error}}
            <h2 class="text-red mt-0"><i class="material-icons mr-4">error_outline</i>{{fetch.error}} [{{fetch.status}}]</h2>
        {{else}}
            {{#each events}}
                <div class="mdc-card mdc-card--outlined ma-2">
                    <div class="mdc-card__primary-action">
                    <a href="./event?id={{id}}" class="mdc-theme--on-surface pa-6">
                        <div class="d-flex align-center">
                            <h2 class="my-0 mr-auto text-truncate">{{name}}</h2>
                            {{#if deleted}}
                                <span class="chip text-white bg-red ml-2">deleted</span>
                            {{else if inactive}}
                                <span class="chip text-white bg-grey ml-2">inactive</span>
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

export class PageHome extends HTMLElement {
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
        const events = _.chain(this.events?.data)
            .sortBy('start_date')
            .map(event => {
                return {
                    id: event.id,
                    name: event.name,
                    location: event.location,
                    deleted: event.deleted_at,
                    inactive: !event.active,
                    startDate: new Date(event.start_date.slice(0,-1)).toLocaleString(undefined, dateOptions),
                    endDate: new Date(event.end_date.slice(0,-1)).toLocaleString(undefined, dateOptions)
                }
            })
            .value()
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
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
            this.events = {
                meId: session.me?.id,
            }
            this.refresh()
            const from = new Date()
            const to = new Date()
            to.setFullYear(to.getFullYear() + 1)
            const params = {
                filters : [
                    { field: 'active', operator: '=', value: 1 },
                    { type: 'and', field: 'start_date', operator: '>=', value: from.toISOString().substring(0, 10) },
                    { type: 'and', field: 'start_date', operator: '<', value: to.toISOString().substring(0, 10) }
                ],
                sort: [{field: 'start_date', direction: 'asc'}]
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
customElements.define('page-home', PageHome)