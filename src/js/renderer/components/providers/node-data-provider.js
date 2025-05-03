import { DataProvider } from "./data-provider";
import { ChangePropertyCommand } from "../../undo-redo/commands/change-property-command";

export class NodeDataProvider extends DataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager);
        this.causesChangeManager = causesChangeManager;
    }

    getInner() {
        throw new Error("Method 'getInner' must be implemented in subclasses.");
    }

    getInnerToMutate() {
        throw new Error("Method 'getInnerToMutate' must be implemented in subclasses.");
    }

    get nodeData() {
        return this._data;
    }

    // changeNonCauseProperty(
    //     propertyName,
    //     isInnerProp,
    //     propertyValue,
    //     causalViewToRender
    // ) {
    //     // this.getInnerToMutate() result can change after selecting another node
    //     const objToMutate = isInnerProp ? this.getInnerToMutate() : this.nodeData;
    //     const oldValue = objToMutate[propertyName];
    //     this.undoRedoManager.execute(
    //         new ChangePropertyCommand(
    //             (newVal) => {
    //                 objToMutate[propertyName] = newVal;
    //                 this._dispatchPropertyChanged(propertyName, propertyValue);
    //                 causalViewToRender.render();
    //             },
    //             propertyValue,
    //             oldValue,
    //             propertyName
    //         )
    //     );
    // }
}