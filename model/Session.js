import AuthApi from '../api/AuthApi.js'

const AuthTokenCookie = 'App-Web-Test.JWTToken'

class SessionInfo {
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
        const response = await AuthApi.user(token)
        if (!response.ok) {
            return { ok: false, error: 'Error reading user info.' }
        }
        this.me = (await response.json()).data
        this.jwtToken = token
        this.setTokenCookie(token)
        this.triggerEvent('me')
        return { ok: true }
    }
    signout() {
        this.me = undefined
        this.jwtToken = undefined
        this.deleteTokenCookie()
        this.triggerEvent('me')
    }
    setTokenCookie(token) {
        document.cookie = `${AuthTokenCookie}=${token}; Path=/;`
    }
    deleteTokenCookie() {
        document.cookie = `${AuthTokenCookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }
}
export const session = new SessionInfo()

window.addEventListener('load', async () => {
    document.getElementsByTagName('body')[0].style.display = 'none'
    await session.signinWithCookie()
    document.getElementsByTagName('body')[0].style.display = 'block'
})