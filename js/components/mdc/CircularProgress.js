const MDCCircularProgress = mdc.linearProgress.MDCCircularProgress

const template = `
<div class="mdc-circular-progress{{#if indeterminate}} mdc-circular-progress--indeterminate{{/if}}" style="width:{{sz}}px;height:{{sz}}px;">
  <div class="mdc-circular-progress__determinate-container">
    <svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 {{sz}} {{sz}}" xmlns="http://www.w3.org/2000/svg">
      <circle class="mdc-circular-progress__determinate-track" cx="{{c}}" cy="{{c}}" r="{{r}}" stroke-width="{{strokeWidth}}"/>
      <circle class="mdc-circular-progress__determinate-circle" cx="{{c}}" cy="{{c}}" r="{{r}}" stroke-dasharray="{{dash}}" stroke-dashoffset="{{dash}}" stroke-width="{{strokeWidth}}"/>
    </svg>
  </div>
  <div class="mdc-circular-progress__indeterminate-container">
    <div class="mdc-circular-progress__spinner-layer">
      <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 {{sz}} {{sz}}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="{{c}}" cy="{{c}}" r="{{r}}" stroke-dasharray="{{dash}}" stroke-dashoffset="{{dashOffset}}" stroke-width="{{strokeWidth}}"/>
        </svg>
      </div>
      <div class="mdc-circular-progress__gap-patch">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 {{sz}} {{sz}}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="{{c}}" cy="{{c}}" r="{{r}}" stroke-dasharray="{{dash}}" stroke-dashoffset="{{dashOffset}}" stroke-width="{{gapStrokeWidth}}"/>
        </svg>
      </div>
      <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
        <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 {{sz}} {{sz}}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="{{c}}" cy="{{{c}}}" r="{{r}}" stroke-dasharray="{{dash}}" stroke-dashoffset="{{dashOffset}}" stroke-width="{{strokeWidth}}"/>
        </svg>
      </div>
    </div>
  </div>
</div>
`

const defaults = {
    size: 'medium'
}
export class CircularProgress extends HTMLElement {
    connectedCallback() {
        this.refresh()
    }
    get templateData() {
        const baseSize = this.baseSize
        const dashSize = this.dashSize
        return {
            indeterminate: this.hasAttribute('indeterminate'),
            sz: baseSize*2,
            c: baseSize,
            r: this.radius,
            strokeWidth: this.strokeWidth,
            gapStrokeWidth: this.gapStrokeWidth,
            dash: dashSize*2,
            dashOffset: dashSize
        }
    }
    refresh() {
        this.innerHTML = Handlebars.compile(template)(this.templateData)
    }
    get baseSize() {
        const size = this.getAttribute('size') || defaults.size
        switch (size) {
            case 'small': return 12
            case 'large': return 24
            default: return 16
        }
    }
    get dashSize() {
        const size = this.getAttribute('size') || defaults.size
        switch (size) {
            case 'small': return 27.489
            case 'large': return 56.549
            default: return 39.27
        }
    }
    get radius() {
        const size = this.getAttribute('size') || defaults.size
        switch (size) {
            case 'small': return 8.75
            case 'large': return 18
            default: return 12.5
        }
    }
    get strokeWidth() {
        const size = this.getAttribute('size') || defaults.size
        switch (size) {
            case 'small': return 2.5
            case 'large': return 4
            default: return 3
        }
    }
    get gapStrokeWidth() {
        const size = this.getAttribute('size') || defaults.size
        switch (size) {
            case 'small': return 2
            case 'large': return 3.2
            default: return 2.4
        }
    }
}
customElements.define('mdc-circular-progress', CircularProgress)