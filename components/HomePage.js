import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const template = `
{{#if visible}}
<div class="pa-4">
    <h1>{{#if signedin}}Signed In{{else}}Guest{{/if}}</h1>
    {{#if events}}
        <h2>Events</h2>
        {{#each events}}
            <div class="mdc-card mdc-card--outlined ma-2">
                <div class="mdc-card__primary-action pa-6">
                    <div class="d-flex align-center">
                        <h2 class="my-0 mr-auto text-truncate">{{this.name}}</h2>
                        {{#if deleted}}
                            <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">deleted</span>
                        {{else if inactive}}
                            <span class="chip mdc-theme--on-secondary mdc-theme--secondary-bg ml-2">inactive</span>
                        {{/if}}
                    </div>
                    {{#if location}}<h4 class="mt-2 text-truncate">{{location}}</h4>{{/if}}
                    <div class="text-truncate">{{startDate}} - {{endDate}}</div>
                    <div class="mdc-card__ripple"></div>
                </div>
            </div>
        {{/each}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class HomePage extends HTMLElement {
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
        const events = _.chain(this.events?.data)
            .sortBy('start_date')
            .map(event => {
                return {
                    name: event.name,
                    location: event.location,
                    deleted: event.deleted_at,
                    inactive: !event.active,
                    startDate: new Date(event.start_date).toLocaleString(undefined, dateOptions),
                    endDate: new Date(event.end_date).toLocaleString(undefined, dateOptions)
                }
            })
            .value()
        return {
            visible: session.loaded,
            signedin: session.isSignedIn(),
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
                data: undefined
            }
            this.refresh()
            const response = await EventApi.getEvents()
            this.events.data = response.ok ? (await response.json())?.data : []
            this.refresh()
        }
    }

    refreshCallback = undefined
    events = undefined
}
customElements.define('home-page', HomePage)