import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if notFound}}
        <h1 class="mt-0">Not Found</h1>
    {{else if notAuthorized}}
        <h1 class="mt-0">Not Authorized</h1>
    {{else if error}}
        <h1 class="mt-0">Error</h1>
    {{else if event}}
        <div class="d-flex align-center">
            <h1 class="my-0 mr-auto text-truncate">{{event.name}}</h1>
            {{#if event.deleted}}
                <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">deleted</span>
            {{else if event.inactive}}
                <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">inactive</span>
            {{/if}}
        </div>
        {{#if event.location}}<h3 class="mt-2 text-truncate">{{event.location}}</h3>{{/if}}
        <div class="text-truncate">{{event.startDate}} - {{event.endDate}}</div>
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
                startDate: new Date(event.start_date).toLocaleString(undefined, dateOptions),
                endDate: new Date(event.end_date).toLocaleString(undefined, dateOptions)
            }
        }
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            notFound: this.event?.status == 404,
            notAuthorized: [401, 403].includes(this.event?.status),
            error: this.event?.status && this.event?.status != 200,
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
            this.event.status = response.status
            this.event.data = response.ok ? (await response.json()).data : undefined
            this.refresh()
        }
    }

    refreshCallback = undefined
    event = undefined
}
customElements.define('page-event', PageEvent)