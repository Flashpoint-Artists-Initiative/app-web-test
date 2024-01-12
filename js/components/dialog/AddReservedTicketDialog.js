import ReservedTicket from '../../model/ReservedTicket.js'
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
            <span>Add Reserved Tickets</span>
        </h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Event</label>
                <h2 class="mt-0">{{eventName}}</h2>
                <div class="page-main overflow-y-auto" style="height:29rem">
                    <label class="d-block">Ticket</label>
                    <button 
                        class="ticket-type-button mdc-button mdc-button--outlined bg-grey-lighten-3 text-grey-darken-2 w-100"
                        style="height: 4rem;text-transform: none;"
                    >
                    </button>
                    <label class="d-block pt-2">Email</label>
                    <mdc-textfield class="w-100" input-class="field-email" input-type="text"></mdc-textfield>
                    <label class="d-block pt-2">Name</label>
                    <mdc-textfield class="w-100" input-class="field-name" input-type="text" input-autocomplete="off"></mdc-textfield>
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
                    <label class="d-block pt-2">Quantity</label>
                    <div class="d-flex w-100 pt-2">
                        <mdc-select surface-fixed class="field-quantityType mr-2"></mdc-select>
                        <div class="quantity-block">
                            <mdc-textfield input-class="field-quantity" input-type="number" input-autocomplete="off" class="d-block" style="width:6rem"></mdc-textfield>
                        </div>
                    </div>
                </div>
                <div class="page-ticketType" style="height:29rem">
                    <div class="d-flex flex-column fill-height">
                        <label class="d-block">Ticket</label>
                        <ul class="mdc-list mdc-list--two-line pt-0 overflow-y-auto">
                            {{#each ticketTypes}}
                            <li class="mdc-list-item">
                                <span class="mdc-list-item__ripple"></span>
                                <div class="d-flex align-center w-100 py-2">
                                    <div class="d-flex flex-column flex-grow-1 flex-shrink-1 text-left" style="min-width:5rem">
                                        <h3 class="text-truncate my-0">{{name}}</h3>
                                        <div class="text-truncate">{{description}}</div>
                                    </div>
                                    <div class="text-right">
                                        <h2 class="pl-4 my-0">{{price}}</h2>
                                    </div>
                                </div>
                            </li>
                            {{/each}}
                        </ul>
                    </div>
                </div>
            </form>
        </div>
        <div class="mdc-dialog__actions">
            <mdc-dialog-button action="cancel" title="Cancel" class="mr-2"></mdc-dialog-button>
            <mdc-dialog-button action="save" title="Save"></mdc-dialog-button>
        </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
{{/if}}`

const ticketTypeButtonTemplate = `
<div class="mdc-button__ripple"></div>
<div class="d-flex align-center w-100">
    <div class="d-flex flex-column flex-grow-1 flex-shrink-1 text-left" style="min-width:5rem">
        <h3 class="text-truncate my-0">{{name}}</h3>
        <div class="text-truncate">{{description}}</div>
    </div>
    <div class="text-right flex-shrink-0">
        <h2 class="pl-4 my-0">{{price}}</h2>
    </div>
</div>`

export class AddReservedTicketDialog extends HTMLElement {
    async connectedCallback() {
        await this.refresh()
    }
    get templateData() {
        return {
            open: this.isOpen,
            ticketTypes: this.ticketTypes,
            eventName: this.eventName,
            reservedTicket: this.reservedTicket
        }
    }
    get expirationType() {
        return this.reservedTicket.expiration_date ? 'yes' : 'no'
    }
    get ticketType() {
        return _.find(this.ticketTypes, {id: this.reservedTicket.ticket_type_id })
    }
    refreshFormFields() {
        this.refreshVisiblePage()
        this.querySelector('.ticket-type-button').innerHTML = Handlebars.compile(ticketTypeButtonTemplate)(this.ticketType)
        this.querySelector('.field-expiration_type').selected = this.expirationType
        this.querySelector('.field-quantityType').selected = this.quantityType
        this.refreshForExpirationType()
        this.refreshForQuantityType()
    }
    refreshVisiblePage() {
        Array('main','ticketType').forEach(type => {
            const show = type == this.page
            this.querySelector(`.page-${type}`).style.display = show ? 'block' : 'none'
        })
        const showBackButton = this.page != 'main' && !this.firstSelect
        if (showBackButton) {
            this.querySelector(['.mdc-dialog__title']).style.paddingLeft = '0'
        } else {
            this.querySelector(['.mdc-dialog__title']).style.removeProperty('padding-left')
        }
        this.querySelector('.back-button').style.display = showBackButton ? 'block' : 'none'
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
    refreshForQuantityType() {
        const show = this.quantityType == 'n'
        this.querySelector('.quantity-block').style.display = show ? 'block' : 'none'
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
            const quantityTypeSelect = element.querySelector('.field-quantityType')
            quantityTypeSelect.items = [
                {text: 'One', value: '1'},
                {text: 'Multiple', value: 'n'}
            ]
            element.querySelector('.field-quantity').value = '1'
            this.refreshFormFields()

            element.querySelector('.ticket-type-button').addEventListener('click', event => {
                event.preventDefault()
                this.ticketTypeList.selectedIndex = _.findIndex(this.ticketTypes, {id: this.reservedTicket.ticket_type_id})
                this.page = 'ticketType'
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
            quantityTypeSelect.addEventListener('change', event => {
                this.quantityType = event.detail.value
                const quantityField = this.querySelector('.field-quantity')
                switch (this.quantityType) {
                    case '1':
                        quantityField.value = '1'
                        break
                    case 'n':
                        try {
                            if (parseInt(quantityField.value) < 2) {
                                throw ''
                            }
                        } catch {
                            quantityField.value = '2'
                        }
                        break
                }
                if(this.quantityType == '1') {
                    quantityField.value = '1'
                }
                this.refreshForQuantityType()
                quantityField.select()
                quantityField.focus()
            })

            this.querySelector('.back-button').addEventListener('click', event => {
                this.page = 'main'
            })
            this.ticketTypeList = new MDCList(document.querySelector('.page-ticketType .mdc-list'))
            this.ticketTypeList.listen('MDCList:action', event => {
                this.reservedTicket.ticket_type_id = this.ticketTypes[event.detail.index].id
                if (this.expirationType == 'yes') {
                    this.reservedTicket.expiration_date = this.ticketType.sale_end_date
                }
                this.page = 'main'
                this.firstSelect = false
                this.refreshFormFields()
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
                        const info = {
                            ticket: this.reservedTicket,
                            quantity: parseInt(element.querySelector('.field-quantity').value)
                        }
                        this.dispatchEvent(new CustomEvent('save', {detail: info}))
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
            this._page = 'ticketType'
            this.firstSelect = true
            this.quantityType = '1'
            this.refresh()
            this.mdcDialog.open()
        } else {
            this.mdcDialog?.close()
            this.refresh()
        }
    }

    mdcDialog = undefined
    ticketTypeList = undefined
    isOpen = false
    _page = 'main'
    firstSelect = true
    quantityType = '1'
    ticketTypes = []
    eventName = ''
    reservedTicket = new ReservedTicket()
}
customElements.define('add-reserved-ticket-dialog', AddReservedTicketDialog)