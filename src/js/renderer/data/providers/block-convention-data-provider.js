import { DataProvider } from "./data-provider";
import { Command } from "../../undo-redo/commands/command";

export class BlockConventionDataProvider extends DataProvider {
    // Consequences methods
    addConsequence(consequence) {
        this.#addItem('consequences', consequence);
    }

    removeConsequence(consequence) {
        this.#removeItem('consequences', consequence);
    }

    changeConsequence(oldConsequence, newConsequence) {
        this.#changeItem('consequences', oldConsequence, newConsequence);
    }

    // Causes methods
    addCause(cause) {
        this.#addItem('causes', cause);
    }

    removeCause(cause) {
        this.#removeItem('causes', cause);
    }

    changeCause(oldCause, newCause) {
        this.#changeItem('causes', oldCause, newCause);
    }

    // Private generic methods
    #addItem(property, item) {
        const index = this._data[property].length;
        const cmd = new Command(
            () => this.#insertItem(property, item, index),
            () => this.#removeItemAtIndex(property, index)
        );
        this.undoRedoManager.execute(cmd);
    }

    #removeItem(property, item) {
        const index = this._data[property].indexOf(item);
        if (index === -1) return;

        const cmd = new Command(
            () => this.#removeItemAtIndex(property, index),
            () => this.#insertItem(property, item, index)
        );
        this.undoRedoManager.execute(cmd);
    }

    #changeItem(property, oldItem, newItem) {
        const index = this._data[property].indexOf(oldItem);
        if (index === -1) return;

        const cmd = new Command(
            () => this.#updateItemAtIndex(property, index, newItem),
            () => this.#updateItemAtIndex(property, index, oldItem)
        );
        this.undoRedoManager.execute(cmd);
    }

    #insertItem(property, item, index) {
        this._data[property].splice(index, 0, item);
        this._dispatchMutated();
    }

    #removeItemAtIndex(property, index) {
        const [removed] = this._data[property].splice(index, 1);
        this._dispatchMutated();
        return removed;
    }

    #updateItemAtIndex(property, index, newValue) {
        const oldValue = this._data[property][index];
        this._data[property][index] = newValue;
        this._dispatchMutated();
        return oldValue;
    }
}