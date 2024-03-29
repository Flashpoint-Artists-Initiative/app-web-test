import DateTime from '../../model/DateTime.js'
import Event from '../../model/Event.js'
import { DatePicker } from '../DatePicker.js'
import { DialogButton } from '../mdc/DialogButton.js'
import { Select } from '../mdc/Select.js'
import { TextField } from '../mdc/TextField.js'

const MDCDialog = mdc.dialog.MDCDialog

const template = `
{{#if open}}
<div class="mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface" style="width:640px">
        <h2 class="mdc-dialog__title">{{#if event.id}}Edit Event{{else}}Add Event{{/if}}</h2>
        <div class="mdc-dialog__content">
            <form autocomplete="off" class="my-2">
                <label class="d-block">Name</label>
                <mdc-textfield class="w-100" input-class="field-name" input-type="text" input-tabindex="0"></mdc-textfield>
                {{#if event.id}}
                    <label class="d-block pt-2">Status</label>
                    <mdc-select surface-fullwidth class="field-active w-100"></mdc-select>
                {{/if}}
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
            {{#if event.id}}
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

export class EventDialog extends HTMLElement {
    async connectedCallback() {
        await this.refresh()
    }
    get templateData() {
        return {
            open: this.isOpen,
            event: this.event
        }
    }
    refreshFormFields() {
        Array('name', 'location', 'contact_email').forEach(prop => {
            this.querySelector(`.field-${prop}`).value = this.event[prop]
        })
        const activeSelect = this.querySelector('.field-active')
        if (activeSelect) {
            activeSelect.selected = this.event.active
        }
        this.querySelector('.field-start_date').date = DateTime.parseISOLocalToDate(this.event.start_date)
        this.querySelector('.field-end_date').date = DateTime.parseISOLocalToDate(this.event.end_date)
    }
    async refresh() {
        this.mdcDialog = null
        this.innerHTML = Handlebars.compile(template)(this.templateData)

        const element = this.querySelector('.mdc-dialog')
        if (element) {
            const activeSelect = this.querySelector('.field-active')
            if (activeSelect) {
                activeSelect.items = [
                    {text:'Active', value:1},
                    {text:'Inactive', value:0}
                ]    
            }
            this.refreshFormFields()

            activeSelect?.addEventListener('change', event => {
                this.event.active = parseInt(event.detail.value)
            })

            this.mdcDialog = new MDCDialog(element)
            this.mdcDialog.listen('MDCDialog:closing', async (event) => {
                switch(event.detail.action) {
                    case 'save':
                        Object.assign(this.event, {
                            name: element.querySelector('.field-name').value.trim(),
                            location: element.querySelector('.field-location').value.trim(),
                            contact_email: element.querySelector('.field-contact_email').value.trim(),
                            start_date: element.querySelector('.field-start_date').isoDate.slice(0,10),
                            end_date: element.querySelector('.field-end_date').isoDate.slice(0,10)
                        })
                        this.dispatchEvent(new CustomEvent('save', {detail: this.event}))
                        break
                    case 'delete':
                        this.dispatchEvent(new CustomEvent('delete', {detail: this.event}))
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
    event = new Event()
}
customElements.define('event-dialog', EventDialog)