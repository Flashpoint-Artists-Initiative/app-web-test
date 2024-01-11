import Event from '../model/Event.js'
import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { EventDialog } from './dialog/EventDialog.js'
import { MessageDialog } from './dialog/MessageDialog.js'
import { CircularProgress } from './mdc/CircularProgress.js'

const MDCDialog = mdc.dialog.MDCDialog

const template = `
{{#if ready}}
<div class="pa-4">
    {{#if fetch.done}}
        <div class="d-flex">
            <h1 class="mt-0 mr-auto">Events</h1>
            {{#if roles.admin}}
                <button type="button" class="add-event-button mdc-button mdc-button--unelevated">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Add Event</span>
                </button>
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
<event-dialog></event-dialog>
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
            month: 'long',
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
                startDate: new Date(event.start_date.slice(0,-1)).toLocaleString(undefined, dateOptions),
                endDate: new Date(event.end_date.slice(0,-1)).toLocaleString(undefined, dateOptions)
            }
        })
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

        this.querySelectorAll('.add-event-button').forEach(element => {
            element.addEventListener('click', event => {
                this.openAddEventDialog()
            })
        })
        const addEventDialog = this.querySelector('event-dialog')
        addEventDialog.addEventListener('save', async (event) => {
            await this.addEvent(event.detail)
        })

        if (!this.events || this.events.meId != session.me?.id) {
            this.fetch.done = false
            this.events = {
                meId: session.me?.id,
            }
            this.refresh()
            let params = {}
            if (session.getRoles().admin) {
                params = {
                    with_trashed: true,
                    sort: [{field: 'start_date', direction: 'desc'}]
                }
            } else {
                const from = new Date()
                params = {
                    filters: [
                        { field: 'active', operator: '=', value: 1 },
                        { type: 'and', field: 'start_date', operator: '>=', value: from.toISOString().substring(0, 10) }
                    ],
                    sort: [{field: 'start_date', direction: 'asc'}]
                }
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
    openAddEventDialog() {
        const dialog = this.querySelector('event-dialog')
        dialog.event = new Event()
        dialog.open = true
    }
    async addEvent(event) {
        const results = await MessageDialog.doRequestWithProcessing('Saving event', async () => {
            return await EventApi.addEvent(event)
        })
        if (results.ok) {
            window.location.href = `./event?id=${results.data.data.id}`
        }
    }

    refreshCallback = undefined
    fetch = {}
    events = undefined
    addEventDialog = undefined
}
customElements.define('page-events', PageEvents)