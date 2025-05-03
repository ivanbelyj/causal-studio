import { DataProvider } from "./data-provider";
import { ChangePropertyCommand } from "../../undo-redo/commands/change-property-command";

export class NodeDataProvider extends DataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager);
        this.causesChangeManager = causesChangeManager;
    }

    get nodeData() {
        return this._data;
    }
}