const template = `
<button class="mdc-tab{{#if active}} mdc-tab--active{{/if}}">
    <span class="mdc-tab__content">
        <span class="mdc-tab__text-label">{{title}}</span>
    </span>
    <span class="mdc-tab-indicator{{#if active}} mdc-tab-indicator--active{{/if}}">
        <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
    </span>
    <span class="mdc-tab__ripple"></span>
</button>
`

export class Tab extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        return {
          active: this.hasAttribute('active'),
          title: this.getAttribute('title')
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }
}
customElements.define('mdc-tab', Tab)