import AuthApi from '../api/AuthApi.js'
import UserApi from '../api/UserApi.js'

const AuthTokenCookie = 'App-Web-Test.JWTToken'

class SessionInfo {
    _loaded = false
    me = undefined
    jwtToken = undefined
    eventListeners = new Map()

    addEventListener(type, listener) {
        this.eventListeners.has(type) || this.eventListeners.set(type, [])
        this.eventListeners.get(type).push(listener)
    }
    removeEventListener(type, listener) {
        if (this.eventListeners.has(type)) {
            const listeners = _.without(this.eventListeners.get(type), listener)
            this.eventListeners.set(type, listeners)
        }
    }
    triggerEvent(type) {
        if (this.eventListeners.has(type)) {
            this.eventListeners.get(type).forEach((listener) => {
                listener()
            })
        }
    }
    get loaded() {
        return this._loaded
    }
    set loaded(value) {
        this._loaded = value
        this.triggerEvent('loaded')
    }
    isSignedIn() {
        return this.me?.id 
    }
    getRoles() {
        if (!this.me) {
            return {}
        } else {
            return _.keyBy(this.me.roles, 'name')
        }
    }
    async signinWithCookie() {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith(AuthTokenCookie))
            ?.split('=')[1]
        if (token) {
            await this.fetchUser(token)
        }
    }
    async signin(email, password) {
        const response = await AuthApi.login(email, password)
        if (!response.ok) {
            const info = await response.json()
            return { ok: false, error: `Couldn't sign in. ${info.message}` }
        }
        const authInfo = await response.json()
        return  await this.fetchUser(authInfo.access_token)
    }
    async forgotPassword(email) {
        const response = await AuthApi.forgotPassword(email)
        const info = await response.json()
        return { ok: response.ok, error: info.message }
    }
    async signup(user) {
        const response = await AuthApi.register(user)
        if (!response.ok) {
            const info = await response.json()
            return { ok: false, error: `Couldn't sign up. ${info.message}` }
        }
        const authInfo = await response.json()
        return  await this.fetchUser(authInfo.access_token)
    }
    async fetchUser(token) {
        let response = await AuthApi.user(token)
        if (!response.ok) {
            return { ok: false, error: 'Error reading user info.' }
        }
        const user = (await response.json()).data
        const options = {
            include: 'roles,purchasedTickets,purchasedTickets.ticketType,reservedTickets,reservedTickets.ticketType'
        }
        response = await UserApi.getUser(user.id, options)
        if (!response.ok) {
            return { ok: false, error: 'Error reading user info.' }
        }
        this.me = (await response.json()).data
        if (!this.jwtToken) {
            this.setToken(token)
        }
        this.triggerEvent('me')
        return { ok: true }
    }
    updateUser(patch) {
        this.me = Object.assign(this.me, patch)
        this.me.display_name = this.me.preferred_name || this.me.legal_name
        this.triggerEvent('me')
    }
    signout() {
        this.me = undefined
        this.deleteToken()
        this.triggerEvent('me')
    }
    setToken(token) {
        this.jwtToken = token
        document.cookie = `${AuthTokenCookie}=${token}; Path=/;`
    }
    deleteToken() {
        this.jwtToken = undefined
        document.cookie = `${AuthTokenCookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }
}
export const session = new SessionInfo()

window.addEventListener('load', async () => {
    document.getElementsByTagName('body')[0].style.display = 'none'
    await session.signinWithCookie()
    session.loaded = true
    document.getElementsByTagName('body')[0].style.display = 'block'
})