import { Select } from './mdc/Select.js'

const template = `
<div class="d-flex flex-column">
    <div class="d-flex">
        <mdc-select surface-fixed class="field-datepicker_month flex-grow-1 flex-shrink-1"></mdc-select>
        <mdc-select surface-fixed class="field-datepicker_day flex-grow-1 flex-shrink-1 px-2"></mdc-select>
        <mdc-select surface-fixed class="field-datepicker_year flex-grow-1 flex-shrink-1"></mdc-select>
        {{#if hasHour}}
        <mdc-select surface-fixed class="field-datepicker_hour flex-grow-1 flex-shrink-1 pl-2"></mdc-select>
        {{/if}}
    </div>
    <div>{{dayName}}</div>
</div>
`

export class DatePicker extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        return {
            hasHour: this.hasAttribute('select-hour'),
            dayName: this._date ? this._date.toLocaleString(undefined, {weekday: 'long'}) : ' '
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        const monthSelect = this.querySelector('.field-datepicker_month')
        const daySelect = this.querySelector('.field-datepicker_day')
        const yearSelect = this.querySelector('.field-datepicker_year')
        const hourSelect = this.querySelector('.field-datepicker_hour')
        monthSelect.items = [
            {text: 'Jan', value: 0},
            {text: 'Feb', value: 1},
            {text: 'Mar', value: 2},
            {text: 'Apr', value: 3},
            {text: 'May', value: 4},
            {text: 'Jun', value: 5},
            {text: 'Jul', value: 6},
            {text: 'Aug', value: 7},
            {text: 'Sep', value: 8},
            {text: 'Oct', value: 9},
            {text: 'Nov', value: 10},
            {text: 'Dec', value: 11},
        ]
        if (this._date) {
            monthSelect.selected = this._date.getMonth()
        }
        if (this._date) {
            const month = this._date.getMonth()
            const date = new Date(this._date.getFullYear(), month, 1)
            const dayItems = []
            while (date.getMonth() == month) {
                dayItems.push({
                    text: date.getDate().toString().padStart('0'),
                    value: date.getDate()
                })
                date.setDate(date.getDate()+1)
            }
            daySelect.items = dayItems
            daySelect.selected = this._date.getDate()
        }
        if (this._date) {
            const yearItems = []
            for(let year = this.yearRange[0]; year <= this.yearRange[1]; year++) {
                yearItems.push({text: year, value: year})
            }
            yearSelect.items = yearItems
            yearSelect.selected = this._date.getFullYear()
        }
        if (hourSelect && this._date) {
            const hourItems = []
            for(let h = 0; h < 24; h++) {
                let text
                if (h == 0) {
                    text = 'MIDNIGHT'
                } else if (h == 12) {
                    text = 'NOON'
                } else if (h < 12) {
                    text = h + ' AM'
                } else {
                    text = (h-12) + ' PM'
                }
                hourItems.push({text: text, value: h})
            }
            hourSelect.items = hourItems
            hourSelect.selected = this._date.getHours()
        }

        monthSelect.addEventListener('change', event => {
            if (!this._date) {
                this._date = new Date(new Date().getFullYear(), event.detail.value, 1)
            } else {
                this._date.setMonth(event.detail.value)
            }
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
        daySelect.addEventListener('change', event => {
            this._date.setDate(event.detail.value)
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
        yearSelect.addEventListener('change', event => {
            this._date.setFullYear(event.detail.value)
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
        hourSelect?.addEventListener('change', event => {
            this._date.setHours(event.detail.value, 0, 0, 0)
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
    }
    get isoDate() {
        if (this._date) {
            return this._date.toISOString()
        }
        return null
    }
    get date() {
        return this._date
    }
    set date(value) {
        this._date = value
        this.refresh()
    }

    yearRange = [new Date().getFullYear()-10, new Date().getFullYear()+10]
    _date = undefined
}
customElements.define('date-picker', DatePicker)