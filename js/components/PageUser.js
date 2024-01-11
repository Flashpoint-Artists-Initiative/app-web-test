import DateTime from '../model/DateTime.js'
import { session } from '../model/Session.js'
import TicketType from '../model/TicketType.js'
import UserApi from '../api/UserApi.js'
import TicketTypeApi from '../api/TicketTypeApi.js'
import { CircularProgress } from './mdc/CircularProgress.js'
import { TabBar } from './mdc/TabBar.js'
import { Tab } from './mdc/Tab.js'

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
            <div class="d-flex align-center">
                <h1 class="my-0 mr-auto text-truncate">{{user.name}}</h1>
                {{#if user.deleted}}
                    <span class="chip text-white bg-red ml-2">deleted</span>
                {{else if user.inactive}}
                    <span class="chip text-white bg-grey ml-2">inactive</span>
                {{/if}}
            </div>
            <div class="d-flex align-center mb-2">
                <h3 class="my-2 text-truncate {{#unless user.emailVerified}}text-red {{/unless}}">{{user.email}}</h3>
                {{#unless user.emailVerified}}
                    <i class="material-icons text-red ml-2" title="Unverified">unsubscribe</i>
                {{/unless}}
            </div>
            {{#each user.roleBadges}}
                <div class="d-inline-block {{classes}} rounded px-4 py-2 mb-2 mr-2">
                    <div class="d-flex align-center">
                        <i class="material-icons mr-2">{{icon}}</i>
                        <span class="font-weight-bold">{{name}}</span>
                    </div>
                </div>
            {{/each}}

            {{#if roles.admin}}
                <mdc-tab-bar class="main-tab-bar">
                    {{#each mainTabs}}
                        <mdc-tab {{#if active}}active {{/if}}title="{{title}}"></mdc-tab>
                    {{/each}}
                </mdc-tab-bar>
                <div class="tab-pages my-4">
                    <div style="display:none">
                        <label class="data-label d-block">Birth Date</label>
                        {{#if user.birthdate}}
                            <div>{{user.birthdate}}</div>
                            <label class="data-label d-block mt-2">Age</label>
                            <div>{{user.age}}</div>
                        {{else}}
                            <div>-not entered-</div>
                        {{/if}}
                    </div>
                    <div style="display:none">
                        <h4>TODO: Show purchased and reserved tickets</h4>
                    </div>
                </div>
            {{/if}}
        {{/if}}
    {{else}}
        <div class="d-flex justify-center">
            <mdc-circular-progress indeterminate></mdc-circular-progress>
        </div>
    {{/if}}
</div>
{{/if}}
`

export class PageUser extends HTMLElement {
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
        const mainTabs = [
            {title: 'Details'},
            {title: 'Tickets'},
        ]
        mainTabs[this.activeTab].active = true
        const activeTab = {}
        activeTab['tab' + this.activeTab] = true
        return {
            ready: session.loaded,
            signedin: session.isSignedIn(),
            roles: session.getRoles(),
            mainTabs: mainTabs,
            activeTab: activeTab,
            fetch: this.fetch,
            user: this.getUserData(this.user?.data)
        }
    }
    getUserData(userData) {
        if (!userData) return undefined

        const dateOptions = {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }

        var birthdate = userData.birthday ? new Date(userData.birthday.slice(0,10)) : null
        const user = {
            id: userData.id,
            name: userData.display_name,
            deleted: userData.deleted_at,
            inactive: false,
            roleBadges: this.getRoleBadges(userData.roles),
            email: userData.email,
            emailVerified: userData.email_verified,
            birthdate: birthdate ? birthdate.toLocaleString(undefined, dateOptions) : null,
            age: birthdate ? DateTime.getAge(birthdate) : null
        }
        return user
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        const tabPages = this.querySelector('.tab-pages')
        if (tabPages?.children) {
            tabPages.children[this.activeTab].style.display = 'block'
        }
        const tabBar = this.querySelector('.main-tab-bar')
        if (tabBar) {
            tabBar.addEventListener('activeTab', event => {
                this.activeTab = event.detail.index
                this.refresh()
            })    
        }

        if (!session.loaded) {
            return 
        }
        const id = new URLSearchParams(window.location.search).get('id')
        if (!this.user || this.user.id != id) {
            this.fetch.done = false
            this.user = {
                id: id,
            }
            this.refresh()
            const options = {
                include: 'roles'
            }
            const response = await UserApi.getUser(id, options)
            const data = await response.json()
            this.fetch = {
                done: true,
                status: response.status,
                error: !response.ok ? data.message : '',
                notFound: response.status == 404,
                notAuthorized: [401, 403].includes(response.status)
            }
            this.user.data = response.ok ? data.data : undefined

            this.refresh()
        }
    }
    getRoleBadges(roles) {
        return _.map(roles, role => {
            const data = {
                name: role.label,
                icon: '',
                classes: 'bg-grey text-white'
            }
            const isAdmin = ['super-admin','admin'].includes(role.name)
            const isEventManager = ['event-manager'].includes(role.name)
            if (isAdmin) {
                data.icon = 'verified_user'
                data.classes = 'bg-green text-white'
            } else if (isEventManager) {
                data.icon = 'check_circle'
                data.classes = 'bg-blue text-white'
            }
            return data
        })
    }

    refreshCallback = undefined
    activeTab = 0
    fetch = {}
    user = undefined
}
customElements.define('page-user', PageUser)