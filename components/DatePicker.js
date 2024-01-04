import { Select } from './mdc/Select.js'

const template = `
<div class="d-flex flex-column">
    <div class="d-flex">
        <mdc-select class="field-datepicker_month flex-grow-1 flex-shrink-1 pr-1"></mdc-select>
        <mdc-select class="field-datepicker_day flex-grow-1 flex-shrink-1 px-2"></mdc-select>
        <mdc-select class="field-datepicker_year flex-grow-1 flex-shrink-1 pl-1"></mdc-select>
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
            dayName: this._date ? this._date.toLocaleString(undefined, {weekday: 'long'}) : ' '
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        const monthDatepicker = this.querySelector('.field-datepicker_month')
        const dayDatepicker = this.querySelector('.field-datepicker_day')
        const yearDatepicker = this.querySelector('.field-datepicker_year')
        monthDatepicker.items = [
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
            monthDatepicker.selected = this._date.getMonth()
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
            dayDatepicker.items = dayItems
            dayDatepicker.selected = this._date.getDate()
        }
        if (this._date) {
            const yearItems = []
            for(let year = this.yearRange[0]; year <= this.yearRange[1]; year++) {
                yearItems.push({text: year, value: year})
            }
            yearDatepicker.items = yearItems
            yearDatepicker.selected = this._date.getFullYear()
        }

        monthDatepicker.addEventListener('change', event => {
            if (!this._date) {
                this._date = new Date(new Date().getFullYear(), event.detail.value, 1)
            } else {
                this._date.setMonth(event.detail.value)
            }
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
        dayDatepicker.addEventListener('change', event => {
            this._date.setDate(event.detail.value)
            this.refresh()
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this._date}}))
        })
        yearDatepicker.addEventListener('change', event => {
            this._date.setFullYear(event.detail.value)
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