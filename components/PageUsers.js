import { session } from '../model/Session.js'
import UserApi from '../api/UserApi.js'
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
            <h1 class="mt-0 mr-auto">Users</h1>
        </div>
        {{#if fetch.error}}
            <h2 class="text-red mt-0"><i class="material-icons mr-4">error_outline</i>{{fetch.error}} [{{fetch.status}}]</h2>
        {{else}}
            <div class="mdc-data-table w-100">
                <div class="mdc-data-table__table-container">
                    <table class="mdc-data-table__table">
                        <thead>
                            <tr class="mdc-data-table__header-row">
                                <th class="mdc-data-table__header-cell">Name</th>
                                <th class="mdc-data-table__header-cell">Email</th>
                                <th class="mdc-data-table__header-cell">Sign Up Date</th>
                            </tr>
                        </thead>
                        <tbody class="mdc-data-table__content">
                            {{#each users}}
                            <tr class="mdc-data-table__row">
                                <td class="mdc-data-table__cell">{{name}}</td>
                                <td class="mdc-data-table__cell">{{email}}{{#if email_verified}}<i class="material-icons text-green ml-2">check_circle</i>{{/if}}</td>
                                <td class="mdc-data-table__cell">{{signupDate}}</td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
                </div>
            </div>
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class PageUsers extends HTMLElement {
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
            dateStyle: 'long',
            timeStyle: 'short'
        }
        const users = _.map(this.users?.data, user => {
            return {
                id: user.id,
                name: user.display_name,
                signupDate: new Date(user.created_at).toLocaleString(undefined, dateOptions),
                email: user.email,
                email_verified: user.email_verified,
                deleted: user.deleted_at,
            }
        })
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            fetch: this.fetch,
            users: users
        }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)

        if (!session.loaded) {
            return 
        }
        if (!this.users || this.users.meId != session.me?.id) {
            this.fetch.done = false
            this.users = {
                meId: session.me?.id,
            }
            this.refresh()
            const params = {
                with_trashed: true,
                sort: [{field: 'display_name', direction: 'asc'}]
            }
            const response = await UserApi.search(params)
            const data = await response.json()
            this.fetch = {
                done: true,
                status: response.status,
                error: !response.ok ? data.message : '',
                notFound: response.status == 404,
                notAuthorized: [401, 403].includes(response.status)
            }
            this.users.data = response.ok ? data?.data : []
            this.refresh()
        }
    }

    refreshCallback = undefined
    fetch = {}
    users = undefined
    addEventDialog = undefined
}
customElements.define('page-users', PageUsers)