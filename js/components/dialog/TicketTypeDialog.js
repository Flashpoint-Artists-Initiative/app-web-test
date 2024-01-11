import TicketType from '../../model/TicketType.js'
import { DatePicker } from '../DatePicker.js'
import { DialogButton } from '../mdc/DialogButton.js'
import { Select } from '../mdc/Select.js'
import { TextArea } from '../mdc/TextArea.js'
import { TextField } from '../mdc/TextField.js'

const MDCDialog = mdc.dialog.MDCDialog

const template = `
{{#if open}}
<div class="mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface" style="width:640px">
        <h2 class="mdc-dialog__title">{{#if ticketType.id}}Edit Ticket{{else}}Add Ticket{{/if}}</h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Event</label>
                <h2 class="mt-0">{{event.name}}</h2>
                <label class="d-block pt-2">Name</label>
                <mdc-textfield class="w-100" input-class="field-name" input-type="text" input-tabindex="0"></mdc-textfield>
                <label class="d-block pt-2">Status</label>
                <mdc-select surface-fullwidth class="field-active w-100"></mdc-select>
                <label class="d-block pt-2">Description</label>
                <mdc-textarea rows="4" resizable class="w-100" input-class="field-description"></mdc-textarea>
                <label class="d-block pt-2">Sale Start Date</label>
                <date-picker select-hour class="field-sale_start_date"></date-picker>
                <label class="d-block pt-2">Sale End Date</label>
                <date-picker select-hour class="field-sale_end_date"></date-picker>
                <div class="d-flex w-100 pt-2">
                    <div class="d-flex flex-column flex-grow-1 flex-shrink-1">
                        <label class="d-block">Price</label>
                        <mdc-textfield class="w-100" input-class="field-price" input-type="number"></mdc-textfield>
                    </div>
                    <div class="d-flex flex-column flex-grow-1 flex-shrink-1 mx-2">
                        <label class="d-block">Availability</label>
                        <mdc-select surface-fixed class="field-availability w-100"></mdc-select>
                    </div>
                    <div class="quantity-block">
                        <div class="d-flex flex-column flex-grow-1 flex-shrink-1">
                            <label class="d-block">Quantity</label>
                            <mdc-textfield class="w-100" input-class="field-quantity" input-type="number"></mdc-textfield>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="mdc-dialog__actions">
            {{#if ticketType.id}}
                <div class="mr-auto">
                    <button type="button" class="mdc-button mdc-dialog__button text-red" data-mdc-dialog-action="delete">
                        <div class="mdc-button__ripple"></div>
                        <span class="mdc-button__label">Delete</span>
                    </button>
                </div>
            {{/if}}
            <mdc-dialog-button action="cancel" title="Cancel" class="mr-2"></mdc-dialog-button>
            <mdc-dialog-button action="save" title="Save"></mdc-dialog-button>
        </div>
        </div>
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
{{/if}}`

export class TicketTypeDialog extends HTMLElement {
    async connectedCallback() {
        await this.refresh()
    }
    get templateData() {
        return {
            open: this.isOpen,
            event: this.event,
            ticketType: this.ticketType
        }
    }
    refreshFormFields() {
        Array('name','description','price','quantity').forEach(prop => {
            this.querySelector(`.field-${prop}`).value = this.ticketType[prop]
        })
        this.querySelector('.field-active').selected = this.ticketType.active
        this.querySelector('.field-sale_start_date').date = this.ticketType.sale_start_date ? new Date(this.ticketType.sale_start_date) : null 
        this.querySelector('.field-sale_end_date').date = this.ticketType.sale_end_date ? new Date(this.ticketType.sale_end_date) : null
        this.querySelector('.field-availability').selected = this.forPublicSale ? 'yes' : 'no'
        this.refreshForPublicSale()
    }
    refreshForPublicSale() {
        this.querySelector('.quantity-block').style.opacity = this.forPublicSale ? '1' : '0'
    }
    async refresh() {
        this.mdcDialog = null
        this.innerHTML = Handlebars.compile(template)(this.templateData)

        const element = this.querySelector('.mdc-dialog')
        if (element) {
            const activeSelect = element.querySelector('.field-active')
            activeSelect.items = [
                {text:'Active', value:1},
                {text:'Inactive', value:0}
            ]    
            const availabilitySelect = element.querySelector('.field-availability')
            availabilitySelect.items = [
                {text: 'Public Sale', value: 'yes'},
                {text: 'Reserved Only', value: 'no'}
            ]
            this.refreshFormFields()

            availabilitySelect.addEventListener('change', event => {
                this.forPublicSale = event.detail.value == 'yes'
                if (this.forPublicSale) {
                    this.ticketType.quantity = 0
                }
                this.refreshForPublicSale()
            })

            activeSelect.addEventListener('change', event => {
                this.ticketType.active = parseInt(event.detail.value)
            })

            this.mdcDialog = new MDCDialog(element)
            this.mdcDialog.listen('MDCDialog:closing', async (event) => {
                switch(event.detail.action) {
                    case 'save':
                        Object.assign(this.ticketType, {
                            name: element.querySelector('.field-name').value.trim(),
                            description: element.querySelector('.field-description').value.trim(),
                            sale_start_date: element.querySelector('.field-sale_start_date').isoDate,
                            sale_end_date: element.querySelector('.field-sale_end_date').isoDate,
                            price: parseFloat(element.querySelector('.field-price').value.trim()),
                            quantity: this.forPublicSale ? parseInt(element.querySelector('.field-quantity').value.trim()) : 0
                        })
                        this.dispatchEvent(new CustomEvent('save', {detail: this.ticketType}))
                        break
                    case 'delete':
                        this.dispatchEvent(new CustomEvent('delete', {detail: this.ticketType}))
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
            this.forPublicSale = this.ticketType.quantity > 0
            this.refresh()
            this.mdcDialog.open()
        } else {
            this.mdcDialog?.close()
            this.refresh()
        }
    }

    mdcDialog = undefined
    isOpen = false
    event = {}
    ticketType = new TicketType()
    forPublicSale = true
}
customElements.define('ticket-type-dialog', TicketTypeDialog)