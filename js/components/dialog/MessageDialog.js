const MDCDialog = mdc.dialog.MDCDialog

const template = `
<div class="mdc-dialog">
    <div class="mdc-dialog__container" >
        <div class="mdc-dialog__surface">
        <h2 class="mdc-dialog__title">{{title}}</h2>
        <div class="mdc-dialog__content">
            <div class="d-flex justify-center" tabindex="0">
            {{#if content}}
                {{{content}}}
            {{else if message}}
                <div class="pa-2">{{message}}</div>
            {{/if}}
            </div>
        </div>
        {{#if buttons.length}}
            <div class="mdc-dialog__actions">
                {{#each buttons}}
                    <mdc-dialog-button {{#if action}}action="{{action}}" {{/if}}title="{{title}}"></mdc-dialog-button>
                {{/each}}
            </div>
        {{/if}}
    </div>
    <div class="mdc-dialog__scrim"></div>
</div>
`
export class MessageDialog {
    static async doRequestWithProcessing(processingText, request) {
        const dialog = new MessageDialog()
        dialog.showProcessing(processingText)
        const response = await request()
        const data = await response.json()
        dialog.close()
        if (!response.ok) {
            dialog.showMessage('Error', data.message)
        }
        return {ok: response.ok, response: response, data: data}
    }

    showProcessing(title) {
        const templateData = {
            title: title,
            content: '<mdc-circular-progress indeterminate class="py-6"></mdc-circular-progress>'
        }
        this.openDialog(templateData)
    }
    showMessage(title, message) {
        const templateData = {
            title: title,
            message: message,
            buttons: [
                {action: 'close', title: 'Close'}
            ]
        }
        this.openDialog(templateData)
    }
    openDialog(templateData) {
        this.close()
        this.dialogElement = document.createElement("div")
        this.dialogElement.innerHTML = Handlebars.compile(template)(templateData)
        document.body.appendChild(this.dialogElement);
        this.dialog = new MDCDialog(this.dialogElement.querySelector('.mdc-dialog'))
        this.dialog.open()  
    }
    close() {
        this.dialog?.close()
        this.dialogElement?.remove()
    }
}