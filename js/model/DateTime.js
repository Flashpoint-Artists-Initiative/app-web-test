export default class DateTime {
    static getDateData(date) {
        return {
            dayOfWeek: date.toLocaleString(undefined, {weekday:'short'}),
            date: date.toLocaleString(undefined, {dateStyle:'medium'}),
            time: date.toLocaleString(undefined, {timeStyle:'short'})
        }
    }
    static getAge(birthdate) {
        const now = new Date()
        let age = now.getFullYear() - birthdate.getFullYear()
        const m = now.getMonth() - birthdate.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < birthdate.getDate())) {
            age--
        }
        return age
    }
}