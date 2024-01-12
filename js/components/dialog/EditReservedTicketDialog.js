import UserApi from '../../api/UserApi.js'
import ReservedTicket from '../../model/ReservedTicket.js'
import { CircularProgress } from '../mdc/CircularProgress.js'
import { DatePicker } from '../DatePicker.js'
import { DialogButton } from '../mdc/DialogButton.js'
import { Select } from '../mdc/Select.js'
import { TextField } from '../mdc/TextField.js'

const MDCDialog = mdc.dialog.MDCDialog
const MDCList = mdc.list.MDCList

const template = `
{{#if open}}
<div class="mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface" style="width:640px">
        <h2 class="mdc-dialog__title d-flex align-center pt-2">
            <button class="back-button mdc-icon-button material-icons mx-2 pa-0" style="width:40px;height:40px;">
                <div class="mdc-icon-button__ripple"></div>
                arrow_back
            </button>
            <span>Edit Reserved Ticket</span>
        </h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Event</label>
                <h2 class="mt-0">{{eventName}}</h2>
                <div class="page-main overflow-y-auto" style="height:27rem">
                    <label class="d-block">Ticket</label>
                    <div class="bg-grey-lighten-3 rounded-sm w-100" style="box-shadow:0 0 0 1px #BDBDBD inset">
                        <div class="d-flex align-center px-4 py-2">
                            <div class="d-flex flex-column flex-grow-1 flex-shrink-1 text-left" style="min-width:5rem">
                                <h3 class="text-truncate my-0">{{ticketType.name}}</h3>
                                <div class="text-truncate">{{ticketType.description}}</div>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <h2 class="pl-4 my-0">{{ticketType.price}}</h2>
                            </div>
                        </div>
                    </div>
                    <div class="has-user-true">
                        <label class="d-block mt-2">Assigned To</label>
                        <button 
                            class="user-button mdc-button mdc-button--outlined bg-grey-lighten-3 text-grey-darken-2 w-100"
                            style="height: 4rem;text-transform: none;"
                        >
                        </button>
                    </div>
                    <div class="has-user-false">
                        <label class="d-block pt-2">Email</label>
                        <mdc-textfield class="w-100" input-class="field-email" input-type="text" input-value="{{reservedTicket.email}}"></mdc-textfield>
                        <label class="d-block pt-2">Name</label>
                        <mdc-textfield class="w-100" input-class="field-name" input-type="text" input-autocomplete="off" input-value="{{reservedTicket.name}}"></mdc-textfield>
                        <button 
                            class="user-button mdc-button mdc-button--outlined bg-grey-lighten-3 text-grey-darken-2 w-100 mt-2"
                        >
                            <div class="mdc-button__ripple"></div>
                            <span class="mdc-button__label">Assign To User</span>
                        </button>
                    </div>
                    <label class="d-block pt-2">Expiration</label>
                    <mdc-select surface-fullwidth class="field-expiration_type w-100"></mdc-select>
                    <div class="mt-2">
                        <div class="expiration-block-yes">
                            <date-picker select-hour class="field-expiration_date"></date-picker>
                        </div>
                        <div class="expiration-block-no">
                            <div class="ticket-sale-end"></div>
                        </div>
                    </div>
                </div>
                <div class="page-users" style="height:27rem">
                    <div class="user-list-container d-flex flex-column fill-height">
                        <div class="d-flex align-center justify-center fill-height">
                            <mdc-circular-progress indeterminate></mdc-circular-progress>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="mdc-dialog__actions">
            <div class="mr-auto">
                <button type="button" class="mdc-button mdc-dialog__button text-red" data-mdc-dialog-action="delete">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Delete</span>
                </button>
            </div>
            <mdc-dialog-button action="cancel" title="Cancel" class="mr-2"></mdc-dialog-button>
            <mdc-dialog-button action="save" title="Save"></mdc-dialog-button>
        </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
{{/if}}`

const userButtonTemplate = `
<div class="mdc-button__ripple"></div>
<div class="d-flex align-center w-100">
    <div class="d-flex flex-column flex-grow-1 flex-shrink-1 text-left" style="min-width:5rem">
        <h3 class="text-truncate my-0">{{user.display_name}}</h3>
        <div class="text-truncate">{{user.email}}</div>
    </div>
</div>`

const userListTemplate = `
<ul class="mdc-list mdc-list--two-line pt-0 overflow-y-auto">
    {{#each this}}
    <li class="mdc-list-item">
        <span class="mdc-list-item__ripple"></span>
        <div class="d-flex align-center w-100 py-2">
            <div class="d-flex flex-column flex-grow-1 flex-shrink-1 text-left" style="min-width:5rem">
                <h3 class="text-truncate my-0">{{display_name}}</h3>
                <div class="text-truncate">{{email}}</div>
            </div>
        </div>
    </li>
    {{/each}}
</ul>`

export class EditReservedTicketDialog extends HTMLElement {
    async connectedCallback() {
        await this.refresh()
    }
    get templateData() {
        return {
            open: this.isOpen,
            ticketType: this.ticketType,
            eventName: this.eventName,
            reservedTicket: this.reservedTicket
        }
    }
    get expirationType() {
        return this.reservedTicket.expiration_date ? 'yes' : 'no'
    }
    refreshFormFields() {
        this.refreshVisiblePage()
        Array('true','false').forEach(type => {
            const show = type == Boolean(this.reservedTicket.user).toString()
            this.querySelector(`.has-user-${type}`).style.display = show ? 'block' : 'none'
        })
        this.querySelector('.has-user-true .user-button').innerHTML = Handlebars.compile(userButtonTemplate)(this.reservedTicket)
        this.querySelector('.field-expiration_type').selected = this.expirationType
        this.refreshForExpirationType()
    }
    refreshVisiblePage() {
        Array('main','users').forEach(type => {
            const show = type == this.page
            this.querySelector(`.page-${type}`).style.display = show ? 'block' : 'none'
        })
        const showBackButton = this.page != 'main'
        if (showBackButton) {
            this.querySelector(['.mdc-dialog__title']).style.paddingLeft = '0'
        } else {
            this.querySelector(['.mdc-dialog__title']).style.removeProperty('padding-left')
        }
        this.querySelector('.back-button').style.display = showBackButton ? 'block' : 'none'
    }
    refreshUsersList() {
        this.querySelector('.user-list-container').innerHTML = Handlebars.compile(userListTemplate)(this.users)
        this.userList = new MDCList(document.querySelector('.page-users .mdc-list'))
        this.userList.selectedIndex = _.findIndex(this.users, {id: this.reservedTicket.user_id})
        this.userList.listen('MDCList:action', event => {
            this.reservedTicket.user = this.users[event.detail.index]
            this.reservedTicket.user_id = this.reservedTicket.user.id
            this.page = 'main'
            this.refreshFormFields()
        })
    }
    refreshForExpirationType() {
        const expirationType = this.expirationType
        Array('yes','no').forEach(type => {
            const show = type == expirationType
            this.querySelector(`.expiration-block-${type}`).style.display = show ? 'block' : 'none'
        })
        this.querySelector('.field-expiration_date').date = this.reservedTicket.expiration_date ? new Date(this.reservedTicket.expiration_date) : null
        const dateOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }
        this.querySelector('.ticket-sale-end').textContent = this.ticketType.endDate.toLocaleString(undefined, dateOptions)
    }
    async refresh() {
        this.mdcDialog = null
        this.innerHTML = Handlebars.compile(template)(this.templateData)

        const element = this.querySelector('.mdc-dialog')
        if (element) {
            const expirationTypeSelect = element.querySelector('.field-expiration_type')
            expirationTypeSelect.items = [
                {text: 'Use ticket end date', value: 'no'},
                {text: 'Set expiration time', value: 'yes'}
            ]
            this.refreshFormFields()
            if (this.users) {
                this.refreshUsersList()
            }

            element.querySelectorAll('.user-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.preventDefault()
                    this.page = 'users'
                    if (this.userList) {
                        const i = _.findIndex(this.users, {id: this.reservedTicket.user_id})
                        this.userList.selectedIndex = _.findIndex(this.users, {id: this.reservedTicket.user_id})
                    }
                    if (!this.users) {
                        await this.fetchUsers()
                    }
                })
            })
            expirationTypeSelect.addEventListener('change', event => {
                switch(event.detail.value) {
                    case 'yes':
                        this.reservedTicket.expiration_date = this.ticketType.sale_end_date
                        break
                    case 'no':
                        this.reservedTicket.expiration_date = null
                        break
                }
                this.refreshForExpirationType()
            })

            this.querySelector('.back-button').addEventListener('click', event => {
                this.page = 'main'
            })

            this.mdcDialog = new MDCDialog(element)
            this.mdcDialog.listen('MDCDialog:closing', async (event) => {
                switch(event.detail.action) {
                    case 'save':
                        Object.assign(this.reservedTicket, {
                            email: element.querySelector('.field-email').value.trim(),
                            name: element.querySelector('.field-name').value.trim()
                        })
                        if (this.expirationType == 'yes') {
                            this.reservedTicket.expiration_date = element.querySelector('.field-expiration_date').isoDate
                        } else {
                            this.reservedTicket.expiration_date = null
                        }
                        this.dispatchEvent(new CustomEvent('save', {detail: this.reservedTicket}))
                        break
                    case 'delete':
                        this.dispatchEvent(new CustomEvent('delete', {detail: this.reservedTicket}))
                        break
                }
                this.isOpen = false
                this.refresh()
            })
        }
    }
    get page() {
        return this._page
    }
    set page(value) {
        this._page = value
        this.refreshVisiblePage()
    }
    set open(value) {
        this.isOpen = value
        if (value) {
            this._page = 'main'
            this.refresh()
            this.mdcDialog.open()
        } else {
            this.mdcDialog?.close()
            this.refresh()
        }
    }
    async fetchUsers() {
        const params = {
            sort: [{field: 'display_name', direction: 'asc'}],
            limit: 200
        }
        const response = await UserApi.search(params)
        const data = await response.json()
        /*
        this.fetch = {
            done: true,
            status: response.status,
            error: !response.ok ? data.message : '',
            notFound: response.status == 404,
            notAuthorized: [401, 403].includes(response.status)
        }
        */
        this.users = response.ok ? data?.data : []
        if (response.ok) {
            this.refreshUsersList()
        } else {

        }
    }

    mdcDialog = undefined
    userList = undefined
    isOpen = false
    _page = 'main'
    eventName = ''
    ticketType = undefined
    reservedTicket = new ReservedTicket()
    users = null
}
customElements.define('edit-reserved-ticket-dialog', EditReservedTicketDialog)