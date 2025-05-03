import BlockUtils from "../../common/block-utils";
import { Command } from "../../undo-redo/commands/command";
import { CommandUtils } from "../../undo-redo/commands/command-utils";
import { MacroCommand } from "../../undo-redo/commands/macro-command";
import { NodeDataProvider } from "./node-data-provider";

export class FactDataProvider extends NodeDataProvider {
    constructor(undoRedoManager, causesChangeManager) {
        super(undoRedoManager);
        this.causesChangeManager = causesChangeManager;
    }

    getInnerToMutate() {
        return this._data?.fact;
    }

    getInner() {
        return this.getFact();
    }

    getFact() {
        return this._getFrozenOrNull(this.getInnerToMutate());
    }

    #getWeights(nodeData) {
        return nodeData.fact?.weights;
    }

    #setInitialWeights(nodeData) {
        nodeData.fact.weights = [];
    }

    addNewWeightEdge() {
        // const newEdge = this.#createDefaultWeightEdge(false);
        // const cmd = new Command(
        //   () => this.#addWeightEdge(newEdge),
        //   () => this.#removeWeightEdge(newEdge)
        // );
        const nodeData = this._data;

        CommandUtils.executeUndoRedoActionCommand(
            this.undoRedoManager,
            this.#addWeightEdge.bind(this, nodeData),
            this.#removeWeightEdge.bind(this, nodeData),
            this.#createDefaultWeightEdge(null)
        );
    }

    #createDefaultWeightEdge(abstractFactId) {
        return {
            weight: 1,
            causeId: abstractFactId ?? null,
        };
    }

    #addWeightEdge(nodeData, newWeight) {
        if (!this.#getWeights(nodeData)) {
            this.#setInitialWeights(nodeData);
        }
        const weights = this.#getWeights(nodeData);

        weights.push(newWeight);

        if (newWeight.causeId)
            this.causesChangeManager.onCausesAdd(nodeData, [newWeight.causeId]);

        this._dispatchMutated();
    }

    #removeWeightEdge(nodeData, weightEdge) {
        const causalFact = nodeData.fact;

        const weights = this.#getWeights(nodeData);
        const removeIndex = weights.indexOf(weightEdge);
        if (removeIndex != -1) {
            const edgeToRemove = weights[removeIndex];
            weights.splice(removeIndex, 1);
            if (edgeToRemove.causeId) {
                this.causesChangeManager.onCausesRemoved(nodeData, [
                    edgeToRemove.causeId,
                ]);
            } else {
                // There is no removed causes
            }

            if (weights.length === 0) {
                causalFact.weights = undefined;
            }

            this._dispatchMutated();
        } else {
            console.error("trying to remove weight edge that doesn't exist");
        }
    }

    removeEdge(weightEdge) {
        const nodeData = this._data;
        CommandUtils.executeUndoRedoActionCommand(
            this.undoRedoManager,
            this.#removeWeightEdge.bind(this, nodeData),
            this.#addWeightEdge.bind(this, nodeData),
            weightEdge
        );
    }

    changeAbstractFactId(newAbstrId, blockData) {
        const causalFact = this.getFact();
        const oldAbstrId = causalFact.abstractFactId;
        const nodeData = this._data;
        const commands = [];

        commands.push(new Command(
            () => {
                this.#changeAbstractFactId(nodeData, newAbstrId);
            },
            () => {
                this.#changeAbstractFactId(nodeData, oldAbstrId);
            }
        ));

        if (!this.#getWeights(nodeData)?.length && newAbstrId) {
            const defaultWeightEdge = this.#createDefaultWeightEdge(newAbstrId);
            const addRemoveEdgeCmd = new Command(
                () => {
                    // Add first weight edge
                    this.#addWeightEdge(nodeData, defaultWeightEdge);
                },
                () => {
                    // If there was the first weight edge added automatically,
                    // remove it also automatically
                    this.#removeWeightEdge(nodeData, defaultWeightEdge);
                }
            );
            commands.push(addRemoveEdgeCmd);
        }

        if (blockData) {
            this.#addChangeBlockConsequenceMappingCommand(commands, blockData);
        }

        this.undoRedoManager.execute(MacroCommand.fromCommands(...commands));
    }

    #addChangeBlockConsequenceMappingCommand(commands, blockData) {
        const { declaredBlock, blockConsequenceName } = blockData;
        const newCmd = BlockUtils.createChangeBlockConsequenceMappingCommand(
            declaredBlock,
            blockConsequenceName);
        commands.unshift(newCmd);
    }

    #changeAbstractFactId(nodeData, newId) {
        const causalFact = nodeData.fact;

        const oldAbstrId = causalFact.abstractFactId;
        causalFact.abstractFactId = newId;

        this.causesChangeManager.onCauseIdChanged(nodeData, oldAbstrId, newId);

        this._dispatchMutated();
    }

    // // Gets frozen weight edge and return actual that can be mutated
    // #getActualWeightEdge(weightEdge) {
    //   return this.#getWeights().find((edge) => edge === weightEdge);
    // }

    changeWeightEdgeWeight(weightEdge, newWeight, blockData) {
        const setWeightEdge = (weight) => {
            // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
            weightEdge.weight = weight;
            this._dispatchMutated();
        };
        const oldWeight = weightEdge.weight;

        CommandUtils.executeChangeStateCommand(
            this.undoRedoManager,
            setWeightEdge,
            newWeight,
            oldWeight
        );
    }

    // Todo: test with undo and non-clear redo stack selection
    changeWeightEdgeCauseId(weightEdge, newCauseId, blockData) {
        const nodeData = this._data;
        const setWeightEdge = (newCauseId) => {
            // const actualWeightEdge = this.#getActualWeightEdge(weightEdge);
            const oldCauseId = weightEdge.causeId;
            weightEdge.causeId = newCauseId;
            this.causesChangeManager.onCauseIdChanged(
                nodeData,
                oldCauseId,
                newCauseId
            );
            this._dispatchMutated();
        };
        const oldCauseId = weightEdge.causeId;

        const cmd = new Command(
            () => setWeightEdge(newCauseId),
            () => setWeightEdge(oldCauseId)
        );
        const commands = [cmd];

        if (blockData) {
            this.#addChangeBlockConsequenceMappingCommand(commands, blockData);
        }

        this.undoRedoManager.execute(MacroCommand.fromCommands(...commands));
    }
}
