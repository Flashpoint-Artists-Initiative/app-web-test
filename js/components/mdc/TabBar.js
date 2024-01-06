const MDCTabBar = mdc.tabBar.MDCTabBar

const template = `
<div class="mdc-tab-bar" role="tablist">
  <div class="mdc-tab-scroller">
    <div class="mdc-tab-scroller__scroll-area">
      <div class="mdc-tab-scroller__scroll-content">
        {{{childElements}}}
      </div>
    </div>
  </div>
</div>
`

export class TabBar extends HTMLElement {
    connectedCallback() {
        this._innerHtml = this.innerHTML
        this.refresh()
    }
    get templateData() {
        return {
            childElements: this._innerHtml
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
        this.mainTabBar = new MDCTabBar(this.querySelector('.mdc-tab-bar'))
        this.mainTabBar.listen('MDCTabBar:activated', event => {
            this.dispatchEvent(new CustomEvent('activeTab', {detail: event.detail}))
        })
    }
    
    _innerHtml = undefined
    mainTabBar = undefined
}
customElements.define('mdc-tab-bar', TabBar)