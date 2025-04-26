const eventBus = require("js-event-bus")();

export class DataStore {
    #causalBundle;

    constructor() {
        this.#causalBundle = null;
    }

    get causalBundle() {
        return this.#causalBundle;
    }

    set causalBundle(data) {
        this.#causalBundle = data;
        eventBus.emit("causalBundleOpened", null, {
            causalBundle: data
        });
    }
}
