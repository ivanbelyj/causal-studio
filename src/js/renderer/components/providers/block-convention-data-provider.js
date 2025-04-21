import { DataProvider } from "./data-provider";

export class BlockConventionDataProvider extends DataProvider {
    addConsequence(consequence) {
        this._data.consequences.push(consequence);
    }

    removeConsequence(consequence) {
        const index = this._data.consequences.indexOf(consequence);
        this._data.consequences.splice(index, 1);
    }

    changeConsequence(oldConsequence, newConsequence) {
        const index = this._data.consequences.indexOf(oldConsequence);
        this._data.consequences.splice(index, 1, newConsequence);
    }
}