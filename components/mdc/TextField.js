const template = `
<label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label" style="width:100%">
    <span class="mdc-text-field__ripple"></span>
    <input 
        class="mdc-text-field__input{{#if inputClass}} {{inputClass}}{{/if}}"
        {{#if inputType}}type="{{inputType}}"{{/if}}
        {{#if inputAutocomplete}}autocomplete="{{inputAutocomplete}}"{{/if}}
        {{#if inputTabIndex}}tabindex="{{inputTabIndex}}"{{/if}}
    >
    <span class="mdc-line-ripple"></span>
</label>
`

export class TextField extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        return {
            inputClass: this.getAttribute('input-class'),
            inputType: this.getAttribute('input-type'),
            inputAutocomplete: this.getAttribute('input-autocomplete'),
            inputTabIndex: this.getAttribute('input-tabindex'),
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }
}
customElements.define('mdc-textfield', TextField)