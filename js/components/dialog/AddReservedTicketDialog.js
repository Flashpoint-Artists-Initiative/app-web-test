import ReservedTicket from '../../model/ReservedTicket.js'
import { DatePicker } from '../DatePicker.js'
import { DialogButton } from '../mdc/DialogButton.js'
import { Select } from '../mdc/Select.js'
//import { TextArea } from '../mdc/TextArea.js'
//import { TextField } from '../mdc/TextField.js'

const MDCDialog = mdc.dialog.MDCDialog

const template = `
{{#if open}}
<div class="mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface" style="width:640px">
        <h2 class="mdc-dialog__title">Add Reserved Ticket</h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Event</label>
                <h2 class="mt-0">{{eventName}}</h2>
                <label class="d-block">Ticket</label>
                <mdc-select surface-fixed class="field-ticket_type_id" input-tabindex="0"></mdc-select>
                <label class="d-block pt-2">Email</label>
                <mdc-textfield class="w-100" input-class="field-email" input-type="text"></mdc-textfield>
                <label class="d-block pt-2">Name</label>
                <mdc-textfield class="w-100" input-class="field-name" input-type="text"></mdc-textfield>
                <label class="d-block pt-2">Expiration</label>
                <mdc-select surface-fixed class="field-expiration_type w-100"></mdc-select>
                <div class="mt-2">
                    <div class="expiration-block-yes">
                        <date-picker select-hour class="field-expiration_date"></date-picker>
                    </div>
                    <div class="expiration-block-no">
                        <div class="ticket-sale-end"></div>
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

const ticketTypeItemTemplate = `
<div class="d-flex align-center w-100 py-2">
    <div class="d-flex flex-column" style="width:20rem">
        <h3 class="my-0">{{name}}</h3>
        <div class="text-truncate">{{description}}</div>
    </div>
    <div class="text-right" style="width:8rem">
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
            eventName: this.eventName,
            ticketTypes: this.ticketTypes
        }
    }
    get expirationType() {
        return this.reservedTicket.expiration_date ? 'yes' : 'no'
    }
    get ticketType() {
        return _.find(this.ticketTypes, {id: this.reservedTicket.ticket_type_id })
    }
    refreshFormFields() {
        const ticketTypeSelect = this.querySelector('.field-ticket_type_id')
        ticketTypeSelect.selected = this.reservedTicket.ticket_type_id
        const expirationTypeSelect = this.querySelector('.field-expiration_type')
        expirationTypeSelect.selected = this.expirationType
        this.refreshForExpirationType()
    }
    refreshForExpirationType() {
        const element = this.querySelector('.mdc-dialog')
        const expirationType = this.expirationType
        Array('yes','no').forEach(type => {
            const show = type == expirationType
            element.querySelector(`.expiration-block-${type}`).style.display = show ? 'block' : 'none'
        })
        element.querySelector('.field-expiration_date').date = this.reservedTicket.expiration_date ? new Date(this.reservedTicket.expiration_date) : null
        const dateOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }
        element.querySelector('.ticket-sale-end').textContent = this.ticketType.endDate.toLocaleString(undefined, dateOptions)
    }
    async refresh() {
        this.mdcDialog = null
        this.innerHTML = Handlebars.compile(template)(this.templateData)

        const element = this.querySelector('.mdc-dialog')
        if (element) {
            const ticketTypeSelect = element.querySelector('.field-ticket_type_id')
            const itemTemplate = Handlebars.compile(ticketTypeItemTemplate)
            ticketTypeSelect.items = _.map(this.ticketTypes, ticket => {
                return {
                    value: ticket.id,
                    content: itemTemplate(ticket)
                }
            })
            const expirationTypeSelect = element.querySelector('.field-expiration_type')
            expirationTypeSelect.items = [
                {text: 'Use ticket end date', value: 'no'},
                {text: 'Set expiration time', value: 'yes'}
            ]
            this.refreshFormFields()

            ticketTypeSelect.addEventListener('change', event => {
                this.reservedTicket.ticket_type_id = parseInt(event.detail.value)
                if (this.expirationType == 'yes') {
                    this.reservedTicket.expiration_date = this.ticketType.sale_end_date
                }
                this.refreshForExpirationType()
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

            this.mdcDialog = new MDCDialog(element)
            this.mdcDialog.listen('MDCDialog:closing', async (event) => {
                switch(event.detail.action) {
                    case 'save':
                        this.reservedTicket.email = element.querySelector('.field-email').value.trim()
                        const name = element.querySelector('.field-name').value.trim()
                        if (name) {
                            this.reservedTicket.email = `${name} <${this.reservedTicket.email}>`
                        }
                        if (this.expirationType == 'yes') {
                            this.reservedTicket.expiration_date = element.querySelector('.field-expiration_date').isoDate
                        } else {
                            this.reservedTicket.expiration_date = null
                        }
                        this.dispatchEvent(new CustomEvent('save', {detail: this.reservedTicket}))
                        break
                }
                this.isOpen = false
                this.refresh()
            })
        }
    }
    set open(value) {
        this.isOpen = value
        if (value) {
            this.refresh()
            this.mdcDialog.open()
        } else {
            this.mdcDialog?.close()
            this.refresh()
        }
    }

    mdcDialog = undefined
    isOpen = false
    eventName = ''
    ticketTypes = []
    reservedTicket = new ReservedTicket()
}
customElements.define('add-reserved-ticket-dialog', AddReservedTicketDialog)