import { session } from '../model/Session.js'

const template = `
<div class="mdc-typography--headline1 text-center py-8">🚧</div>
`

export class PagePurchase extends HTMLElement {
    constructor() {
        super()
        this.refreshCallback = () => { this.refresh() }
    }
    async connectedCallback() {
        session.addEventListener('loaded', this.refreshCallback)
        session.addEventListener('me', this.refreshCallback)
        await this.refresh()
    }
    disconnectedCallback() {
        session.removeEventListener('loaded', this.refreshCallback)
        session.removeEventListener('me', this.refreshCallback)
    }
    get templateData() {
        return {
        }
    }
    async refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }

    refreshCallback = undefined
}
customElements.define('page-purchase', PagePurchase)