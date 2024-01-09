const template = `
<label class="mdc-text-field mdc-text-field--filled mdc-text-field--textarea mdc-text-field--no-label" style="width:100%">
  <span class="mdc-text-field__ripple"></span>
  {{#if resizable}}<span class="mdc-text-field__resizer">{{/if}}
    <textarea 
        class="mdc-text-field__input{{#if inputClass}} {{inputClass}}{{/if}}"
        {{#if rows}}rows="{{rows}}"{{/if}}
        {{#if cols}}cols="{{cols}}"{{/if}}
        {{#if inputTabIndex}}tabindex="{{inputTabIndex}}"{{/if}}
    ></textarea>
  {{#if resizable}}</span>{{/if}}
  <span class="mdc-line-ripple"></span>
</label>
`

export class TextArea extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        return {
            resizable: this.hasAttribute('resizable'),
            inputClass: this.getAttribute('input-class'),
            rows: this.getAttribute('rows'),
            cols: this.getAttribute('cols'),
            inputTabIndex: this.getAttribute('input-tabindex')
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }
}
customElements.define('mdc-textarea', TextArea)