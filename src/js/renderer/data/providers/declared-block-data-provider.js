import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { NodeDataProvider } from "./node-data-provider";

export class DeclaredBlockDataProvider extends NodeDataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager, causesChangeManager);
    }

    get #declaredBlock() {
        return this._data?.block;
    }

    getInner() {
        return this.getBlock();
    }

    getInnerToMutate() {
        return this.#declaredBlock;
    }

    getBlock() {
        return this._getFrozenOrNull(this.#declaredBlock);
    }

    /**
     * Changes block references when convention / causes convention was changed
     */
    switchBlockReferences({
        propertyName,
        referenceMapPropertyName,
        newValue,
        oldReferenceMap,
        newReferenceMap
    }) {
        const declaredBlock = this.#declaredBlock;
        const oldValue = declaredBlock[propertyName];

        oldReferenceMap = { ...oldReferenceMap };
        newReferenceMap = { ...newReferenceMap };

        const setBlockReferences = ({ newValue, newBlockReferences }) => {
            // Ensure reference map property exists
            if (!declaredBlock[referenceMapPropertyName]) {
                declaredBlock[referenceMapPropertyName] = {};
            }

            // 1. Reference map
            // Get object that contains references
            const referenceMap = declaredBlock[referenceMapPropertyName];

            const previousCauses = Object.values(declaredBlock[referenceMapPropertyName]);

            // Clear previous reference map
            for (const prop in referenceMap) {
                delete referenceMap[prop];
            }

            // Notify causal view about previous causes
            this.causesChangeManager.onCausesRemoved(this._data, previousCauses);

            // Set new reference map
            Object.assign(referenceMap, newBlockReferences);

            // Notify causal view about new causes
            this.causesChangeManager.onCausesAdd(
                this._data,
                Object.values(newBlockReferences).filter(x => !!x));

            // 2. Convention / causes convention name
            declaredBlock[propertyName] = newValue;

            this._dispatchMutated();
            this._dispatchPropertyChanged(propertyName, newValue);
            this._dispatchPropertyChanged(referenceMapPropertyName, newBlockReferences);
        };

        CommandUtils.executeChangeStateCommand(
            this.undoRedoManager,
            setBlockReferences,
            { newValue, newBlockReferences: newReferenceMap },
            { newValue: oldValue, newBlockReferences: oldReferenceMap }
        );
    }

    changeBlockCause(causeName, newCauseId) {
        const declaredBlock = this.#declaredBlock;
        const setBlockCause = (newCauseId) => {
            const oldCauseId = declaredBlock.blockCausesMap[causeName];
            declaredBlock.blockCausesMap[causeName] = newCauseId;
            this.causesChangeManager.onCauseIdChanged(
                this._data,
                oldCauseId,
                newCauseId
            );
            this._dispatchMutated();
        };
        const oldCauseId = declaredBlock.blockCausesMap[causeName];

        CommandUtils.executeChangeStateCommand(
            this.undoRedoManager,
            setBlockCause,
            newCauseId,
            oldCauseId
        );
    }
}
