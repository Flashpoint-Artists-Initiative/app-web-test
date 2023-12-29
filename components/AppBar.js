import { session } from '../model/Session.js'

const MDCDialog = mdc.dialog.MDCDialog
const MDCLinearProgress = mdc.linearProgress.MDCLinearProgress

export class AppBar extends HTMLElement {
    constructor() {
        super()
        this.refreshCallback = () => { this.refresh() }
        this.addEventListener('click-signin', (event) => {
            this.openSigninDialog()
        })
        this.addEventListener('click-signout', (event) => {
            this.signout()
        })
        this.addEventListener('click-profile', (event) => {
            this.editProfile()
        })
    }
    connectedCallback() {
        session.addEventListener('me', this.refreshCallback)
        this.refresh()
    }
    disconnectedCallback() {
        session.removeEventListener('me', this.refreshCallback)
    }
    refresh() {
        const data = {
            signedIn: session.me?.id,
            name: session.me?.display_name
        }
        this.innerHTML = Handlebars.compile(this.template)(data)
        this.addButtonClickDispatcher('.sign-in-button', 'click-signin')        
        this.addButtonClickDispatcher('.sign-out-button', 'click-signout')
        this.addButtonClickDispatcher('.profile-button', 'click-profile')

        {
            const element = this.querySelector('.signin-dialog')
            this.signinDialog = new MDCDialog(element)
            this.signinDialog.listen('MDCDialog:closing', async (event) => {
                if (event.detail.action == 'accept') {
                    const email = element.querySelector('.field-email').value.trim()
                    const password = element.querySelector('.field-password').value.trim()
                    const error = await this.signin(email, password)
                    if (error) {
                        this.showMessage(error, 'error')
                    }
                }
            })
            this.querySelector('.signin-dialog .forgot-password-link').addEventListener('click', (event) => {
                event.preventDefault()
                this.signinDialog.close()
                this.openForgotPasswordDialog()
            })
            this.querySelector('.signin-dialog .sign-up-link').addEventListener('click', (event) => {
                event.preventDefault()
                this.signinDialog.close()
                this.openSignupDialog()
            })
        }

        {
            const element = this.querySelector('.forgot-password-dialog')
            this.forgotPasswordDialog = new MDCDialog(element)
            this.forgotPasswordDialog.listen('MDCDialog:closing', async (event) => {
                if (event.detail.action == 'accept') {
                    const email = element.querySelector('.field-email').value.trim()
                    const error = await this.forgotPassword(email)
                    if (error) {
                        this.showMessage(error, 'info')
                    }
                }
            })
        }

        {
            const element = this.querySelector('.signup-dialog')
            this.signupDialog = new MDCDialog(element)
            this.signupDialog.listen('MDCDialog:closing', async (event) => {
                if (event.detail.action == 'accept') {
                    const user = {
                        legal_name: element.querySelector('.field-legal-name').value.trim(),
                        preferred_name: element.querySelector('.field-name').value.trim(),
                        email: element.querySelector('.field-email').value.trim(),
                        password: element.querySelector('.field-password').value.trim()
                    }
                    const error = await this.signup(user)
                    if (error) {
                        this.showMessage(error, 'error')
                    }
                }
            })
        }
    }
    addButtonClickDispatcher(selector, eventName) {
        const button = this.querySelector(selector)
        if (button) {
            button.addEventListener('click', (event) => {
                this.dispatchEvent(new Event(eventName))
            })
        }
    }
    openSigninDialog() {
        const element = this.querySelector('.signin-dialog');
        ['email', 'password'].forEach(selector => {
            element.querySelector(`.field-${selector}`).value = ''
        })
        this.signinDialog.open()
    }
    openForgotPasswordDialog() {
        const element = this.querySelector('.forgot-password-dialog');
        ['email'].forEach(selector => {
            element.querySelector(`.field-${selector}`).value = ''
        })
        this.forgotPasswordDialog.open()
    }
    openSignupDialog() {
        const element = this.querySelector('.signup-dialog');
        ['legal-name', 'name', 'email', 'password'].forEach(selector => {
            element.querySelector(`.field-${selector}`).value = ''
        })
        this.signupDialog.open()
    }
    async signin(email, password) {
        const dialog = this.showProcessing('Signing in...')
        const response = await session.signin(email, password)
        dialog.close()
        if (!response.ok) {
            return response.error
        }
    }
    async forgotPassword(email) {
        await session.forgotPassword(email)
        this.showMessage('Password reset email sent.')
    }
    async signup(user) {
        const dialog = this.showProcessing('Signing in...')
        const response = await session.signup(user)
        dialog.close()
        if (!response.ok) {
            return response.error
        }
    }
    signout() {
        session.signout()
    }
    editProfile() {
        alert('TODO: Open My Profile dialog')
    }
    showProcessing(title) {
        const element = this.querySelector('.processing-dialog')
        element.querySelector('h2.mdc-dialog__title').textContent = title
        const dialog = new MDCDialog(element)
        dialog.open()
        const linearProgress = new MDCLinearProgress(element.querySelector('.mdc-linear-progress'))
        linearProgress.determinate = false

        return dialog
    }
    showMessage(error, type) {
        setTimeout(() => {
            alert(error)            
        }, 100)
    }

    refreshCallback = undefined
    signinDialog = undefined
    forgotPasswordDialog = undefined
    signupDialog = undefined
    template = `
<header class=" mdc-top-app-bar mdc-top-app-bar--fixed">
<div class="mdc-top-app-bar__row">
<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
    <span class="mdc-top-app-bar__title">app-web-test</span>
</section>
<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
    {{#if signedIn}}
    <button class="profile-button mdc-button mdc-top-app-bar__action-item mdc-button--unelevated">{{name}}</button>
    <button class="sign-out-button mdc-button mdc-top-app-bar__action-item mdc-button--unelevated">Sign Out</button>
    {{else}}
    <button class="sign-in-button mdc-button mdc-top-app-bar__action-item mdc-button--unelevated">Sign In</button>
    {{/if}}
</section>
</div>

<div class="signin-dialog mdc-dialog">
  <div class="mdc-dialog__container" >
    <div class="mdc-dialog__surface">
      <h2 class="mdc-dialog__title">Sign In</h2>
      <div class="mdc-dialog__content">
        <form class="my-2">
            <label class="d-block">Email</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input class="field-email mdc-text-field__input" type="text" tabindex="0">
                <span class="mdc-line-ripple"></span>
            </label>
            <label class="d-block pt-2">Password</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input class="field-password mdc-text-field__input" type="password">
                <span class="mdc-line-ripple"></span>
            </label>
        </form>
        <div class="d-flex justify-center my-2"><a href="#forgot-password" class="forgot-password-link">Forgot Password?</a></div>
        <div class="d-flex justify-center"><span class="mr-4">Not a member?</span><a href="#sign-up" class="sign-up-link">Sign Up</a></div>
      </div>
      <div class="mdc-dialog__actions">
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Cancel</span>
        </button>
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="accept">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Sign In</span>
        </button>
      </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim"></div>
</div>

<div class="forgot-password-dialog mdc-dialog">
  <div class="mdc-dialog__container" >
    <div class="mdc-dialog__surface">
      <h2 class="mdc-dialog__title">Forgot Password</h2>
      <div class="mdc-dialog__content">
        <form class="my-2">
            <label class="d-block">Email</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input class="field-email mdc-text-field__input" type="text" tabindex="0">
                <span class="mdc-line-ripple"></span>
            </label>
        </form>
      </div>
      <div class="mdc-dialog__actions">
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Cancel</span>
        </button>
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="accept">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Reset Password</span>
        </button>
      </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim"></div>
</div>

<div class="signup-dialog mdc-dialog">
  <div class="mdc-dialog__container" >
    <div class="mdc-dialog__surface">
      <h2 class="mdc-dialog__title">Sign Up</h2>
      <div class="mdc-dialog__content">
        <form autocomplete="off" class="my-2">
            <label class="d-block">Legal Name</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input class="field-legal-name mdc-text-field__input" type="text" tabindex="0">
                <span class="mdc-line-ripple"></span>
            </label>
            <label class="d-block pt-2">Preferred Name</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input class="field-name mdc-text-field__input" type="text">
                <span class="mdc-line-ripple"></span>
            </label>
            <label class="d-block pt-2">Email</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input autocomplete="off" class="field-email mdc-text-field__input" type="text">
                <span class="mdc-line-ripple"></span>
            </label>
            <label class="d-block pt-2">Password</label>
            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--no-label w-100">
                <span class="mdc-text-field__ripple"></span>
                <input autocomplete="new-password" class="field-password mdc-text-field__input" type="password">
                <span class="mdc-line-ripple"></span>
            </label>
        </form>
      </div>
      <div class="mdc-dialog__actions">
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Cancel</span>
        </button>
        <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="accept">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Sign Up</span>
        </button>
      </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim"></div>
</div>

<div class="processing-dialog mdc-dialog">
  <div class="mdc-dialog__container" >
    <div class="mdc-dialog__surface">
      <h2 class="mdc-dialog__title"></h2>
      <div class="mdc-dialog__content">
        <div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate" tabindex="0">
            <div class="mdc-linear-progress__buffering-dots"></div>
            <div class="mdc-linear-progress__buffer"></div>
            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                <span class="mdc-linear-progress__bar-inner"></span>
            </div>
            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                <span class="mdc-linear-progress__bar-inner"></span>
            </div>
        </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim"></div>
</div>
</header>`
}
customElements.define('app-bar', AppBar)