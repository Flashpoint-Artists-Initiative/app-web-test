import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        {{#if fetch.error}}
            <h1 class="mt-0">
                {{#if fetch.notFound}}
                Not Found
                {{else if fetch.notAuthorized}}
                Not Authorized
                {{else}}
                {{fetch.error}}
                {{/if}}
            </h1>
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
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        }
        let event = this.event?.data
        if (event) {
            event = {
                id: event.id,
                name: event.name,
                location: event.location,
                deleted: event.deleted_at,
                inactive: !event.active,
                startDate: new Date(event.start_date.slice(0,-1)).toLocaleString(undefined, dateOptions),
                endDate: new Date(event.end_date.slice(0,-1)).toLocaleString(undefined, dateOptions)
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
            const response = await EventApi.getEvent(id)
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