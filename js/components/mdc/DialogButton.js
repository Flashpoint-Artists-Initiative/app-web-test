const template = `
<button type="button" class="mdc-button mdc-dialog__button"{{#if action}} data-mdc-dialog-action="{{action}}"{{/if}}>
    <div class="mdc-button__ripple"></div>
    <span class="mdc-button__label">{{title}}</span>
</button>
`

export class DialogButton extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        return {
            action: this.getAttribute('action'),
            title: this.getAttribute('title')
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }
}
customElements.define('mdc-dialog-button', DialogButton)