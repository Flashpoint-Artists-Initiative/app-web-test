const MDCSelect = mdc.select.MDCSelect

const template = `
<div class="mdc-select mdc-select--filled mdc-select--no-label w-100">
  <div class="mdc-select__anchor" style="width:auto">
    <span class="mdc-select__ripple"></span>
    <span class="mdc-select__selected-text-container">
      <span class="mdc-select__selected-text">{{selected}}</span>
    </span>
    <span class="mdc-select__dropdown-icon">
      <svg
          class="mdc-select__dropdown-icon-graphic"
          viewBox="7 10 10 5" focusable="false">
        <polygon
            class="mdc-select__dropdown-icon-inactive"
            stroke="none"
            fill-rule="evenodd"
            points="7 10 12 15 17 10">
        </polygon>
        <polygon
            class="mdc-select__dropdown-icon-active"
            stroke="none"
            fill-rule="evenodd"
            points="7 15 12 10 17 15">
        </polygon>
      </svg>
    </span>
    <span class="mdc-line-ripple"></span>
  </div>

  <div class="mdc-select__menu mdc-menu mdc-menu-surface{{#if surfaceFixed}} mdc-menu-surface--fixed{{/if}}{{#if surfaceFullwidth}} mdc-menu-surface--fullwidth{{/if}}">
    <ul class="mdc-list">
        {{#each items}}
            <li class="mdc-list-item{{#if selected}} mdc-list-item--selected{{/if}}" data-value="{{value}}">
                <span class="mdc-list-item__ripple"></span>
                <span class="mdc-list-item__text">{{#if content}}{{{content}}}{{else}}{{text}}{{/if}}</span>
            </li>
        {{/each}}
    </ul>
    </div>
</div>
`

export class Select extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        const data = {
            surfaceFixed: this.hasAttribute('surface-fixed'),
            surfaceFullwidth: this.hasAttribute('surface-fullwidth'),
            selected: '',
            items: _.cloneDeep(this.items)
        }
        for(const item of data.items) {
            if (item.value == this.selected) {
                item.selected = true
                data.selected = item.text
            }
        }
        return data
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        this.select = new MDCSelect(this.querySelector('.mdc-select'))

        this.select.listen('MDCSelect:change', () => {
            this.dispatchEvent(new CustomEvent('change', {detail: {value: this.select.value, index: this.select.selectedIndex}}))
        })
    }
    get items() {
        return this._items
    }
    set items(value) {
        this._items = value
        this.refresh()
    }
    get selected() {
        return this._selected
    }
    set selected(value) {
        this._selected = value
        this.refresh()
    }

    select = undefined
    _items = []
    _selected = undefined
}
customElements.define('mdc-select', Select)