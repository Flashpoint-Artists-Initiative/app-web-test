import { session } from '../model/Session.js'
import EventApi from '../api/EventApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'
import { DatePicker } from './DatePicker.js'
import { DialogButton } from './mdc/DialogButton.js'
import { TextField } from './mdc/TextField.js'

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
{{/if}}

<div class="add-event-dialog mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface" style="width:640px">
        <h2 class="mdc-dialog__title">Add Event</h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Name</label>
                <mdc-textfield class="w-100" input-class="field-name" input-type="text" input-tabindex="0"></mdc-textfield>
                <label class="d-block pt-2">Location</label>
                <mdc-textfield class="w-100" input-class="field-location" input-type="text"></mdc-textfield>
                <label class="d-block pt-2">Contact Email</label>
                <mdc-textfield class="w-100" input-class="field-contact_email" input-type="text"></mdc-textfield>
                <div class="d-flex pt-2">
                    <div class="d-flex flex-column flex-grow-1 pr-2">
                        <label class="d-block">Start Date</label>
                        <date-picker class="field-start_date"></date-picker>
                    </div>
                    <div class="d-flex flex-column flex-grow-1 pl-2">
                        <label class="d-block">End Date</label>
                        <date-picker class="field-end_date"></date-picker>
                    </div>
                </div>
            </form>
        </div>
        <div class="mdc-dialog__actions">
            <mdc-dialog-button action="close" title="Cancel"></mdc-dialog-button>
            <mdc-dialog-button action="accept" title="Save"></mdc-dialog-button>
        </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>

<div class="processing-dialog mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface">
        <h2 class="mdc-dialog__title"></h2>
        <div class="mdc-dialog__content">
            <div class="d-flex justify-center" tabindex="0">
                <mdc-circular-progress indeterminate></mdc-circular-progress>
            </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
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
        this.querySelectorAll('.add-event-button').forEach(element => {
            element.addEventListener('click', event => {
                this.openAddEventDialog()
            })
        })

        {
            const element = this.querySelector('.add-event-dialog')
            this.addEventDialog = new MDCDialog(element)
            this.addEventDialog.listen('MDCDialog:closing', async (event) => {
                if (event.detail.action == 'accept') {
                    const event = {
                        active: 0,
                        name: element.querySelector('.field-name').value.trim(),
                        location: element.querySelector('.field-location').value.trim(),
                        contact_email: element.querySelector('.field-contact_email').value.trim(),
                        start_date: element.querySelector('.field-start_date').isoDate,
                        end_date: element.querySelector('.field-end_date').isoDate
                    }
                    const error = await this.addEvent(event)
                    if (error) {
                        this.showMessage(error, 'info')
                    }
                }
            })
        }

        if (!session.loaded) {
            return 
        }
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
        const element = this.querySelector('.add-event-dialog');
        ['name', 'location', 'contact_email'].forEach(prop => {
            element.querySelector(`.field-${prop}`).value = ''
        })
        element.querySelector('.field-start_date').date = undefined
        element.querySelector('.field-end_date').date = undefined
        this.addEventDialog.open()
    }
    async addEvent(event) {
        const dialog = this.showProcessing('Saving event...')
        const response = await EventApi.addEvent(event)
        dialog.close()
        if (response.ok) {
            this.events = undefined
            this.refresh()
        } else {
            return response.error
        }
    }
    showProcessing(title) {
        const element = this.querySelector('.processing-dialog')
        element.querySelector('h2.mdc-dialog__title').textContent = title
        const dialog = new MDCDialog(element)
        dialog.open()

        return dialog
    }
    showMessage(error, type) {
        setTimeout(() => {
            alert(error)
        }, 100)
    }

    refreshCallback = undefined
    fetch = {}
    events = undefined
    addEventDialog = undefined
}
customElements.define('page-events', PageEvents)