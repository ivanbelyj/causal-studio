import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { NodeDataProvider } from "./node-data-provider";

export class DeclaredBlockDataProvider extends NodeDataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager);
        this.causesChangeManager = causesChangeManager;
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
