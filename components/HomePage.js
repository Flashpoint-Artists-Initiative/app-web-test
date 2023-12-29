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
            <div>{{this.name}}</div>
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
        return {
            visible: session.loaded,
            signedin: session.isSignedIn(),
            events: this.events?.data
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