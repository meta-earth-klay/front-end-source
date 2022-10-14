export default class Event {
    constructor() {
        this.events = {};
        this.$data = {};
    }

    $set(key, value) {
        let oldValue = this.$data[key];
        if (oldValue !== value) {
            this.$data[key] = value;
            this.$emit(key + "Changed", { oldValue, value })
        }
    }

    $get(key) {
        return this.$data[key];
    }

    $on(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    }

    $off(eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            };
        }
    }

    $emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    }
}
