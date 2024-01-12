export default class DateTime {
    static parseISOLocalToDate(dateText) {
        if (!dateText) {
            return null
        }
        const dateParts = dateText.split(/\D/);
        return new Date(dateParts[0], dateParts[1]-1, dateParts[2], 0, 0, 0)
    }
    static toYMD(date) {
        const month = (date.getMonth()+1).toString()
        const day = date.getDate()
        return date.getFullYear() + '-' + month.padStart(2,'0') + '-' + date.padStart(2,'0')
    }

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