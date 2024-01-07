export default class DateTime {
    static getDateData(date) {
        return {
            dayOfWeek: date.toLocaleString(undefined, {weekday:'short'}),
            date: date.toLocaleString(undefined, {dateStyle:'medium'}),
            time: date.toLocaleString(undefined, {timeStyle:'short'})
        }
    }
}