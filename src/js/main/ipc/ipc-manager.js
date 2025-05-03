import { DialogHandler } from "./handlers/dialog-handler";

export class IpcManager {
    #handlers;
    constructor() {
        this.#handlers = [
            new DialogHandler()
        ];
    }
}