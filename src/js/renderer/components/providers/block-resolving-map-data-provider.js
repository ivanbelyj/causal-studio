import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { DataProvider } from "./data-provider";

export class BlockResolvingMapDataProvider extends DataProvider {
    get #blockResolvingMap() {
        return this._data.blockResolvingMap;
    }

    getResolvingMap() {
        return this._getFrozenOrNull(this.#blockResolvingMap);
    }

    getInnerToMutate() {
        return this.getInner();
    }

    getInner() {
        // That's not the best solution, but it's considered as 'inner'
        // for more convenient implementation of resolving map editing
        // in BlockResolvingMapComponent.
        return this.#blockResolvingMap.modelNamesByConventionName;
        // modelNamesByDeclaredBlockId could be also considered as an inner object
    }

    changeModelNameByDeclaredBlockId(declaredBlockId, newModelName) {
        const modelNamesByDeclaredBlockId = this.#blockResolvingMap.modelNamesByDeclaredBlockId;
        const oldModelName = modelNamesByDeclaredBlockId[declaredBlockId];
        const setModelName = (newModelName) => {
            if (newModelName) {
                modelNamesByDeclaredBlockId[declaredBlockId] = newModelName;
            } else {
                // Remove mapping
                delete modelNamesByDeclaredBlockId[declaredBlockId];
            }

            this._dispatchMutated();
        };

        CommandUtils.executeChangeStateCommand(
            this.undoRedoManager,
            setModelName,
            newModelName,
            oldModelName
        );
    }
}