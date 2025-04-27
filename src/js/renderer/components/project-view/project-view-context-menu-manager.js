import { CausalBundleDataManager } from "../../data/causal-bundle-data-manager";
import { blockCausesConventionNodeType, blockConventionNodeType, causalModelNodeType } from "./js-tree-data-utils";
import { ProjectViewContextMenuDialogHelper } from "./project-view-context-menu-dialog-helper";

const eventBus = require("js-event-bus")();

export default class ProjectViewContextMenuManager {
    dataManager;
    causalModelDialogHelper;
    blockConventionDialogHelper;

    /**
     * @param {CausalBundleDataManager} dataManager 
     * @param {*} onProjectDataChanged 
     */
    constructor(dataManager, onProjectDataChanged) {
        this.dataManager = dataManager;
        this.onProjectDataChanged = onProjectDataChanged;

        this.causalModelDialogHelper = new ProjectViewContextMenuDialogHelper({
            dialogIdInfix: "causal-model",
            entityDisplayName: "Causal Model",
            handleAdd: this.#handleAddCausalModel.bind(this),
            handleRemove: this.#handleRemoveCausalModel.bind(this),
            handleRename: this.#handleRenameCausalModel.bind(this),
        });

        this.blockConventionDialogHelper = new ProjectViewContextMenuDialogHelper({
            dialogIdInfix: "block-convention",
            entityDisplayName: "Block Convention",
            handleAdd: this.#handleAddBlockConvention.bind(this),
            handleRemove: this.#handleRemoveBlockConvention.bind(this),
            handleRename: this.#handleRenameBlockConvention.bind(this),
        });

        this.blockCausesConventionDialogHelper = new ProjectViewContextMenuDialogHelper({
            dialogIdInfix: "block-causes-convention",
            entityDisplayName: "Block Causes Convention",
            handleAdd: this.#handleAddBlockCausesConvention.bind(this),
            handleRemove: this.#handleRemoveBlockCausesConvention.bind(this),
            handleRename: this.#handleRenameBlockCausesConvention.bind(this),
        });

        eventBus.on(
            "causalModelSelected",
            ({ causalModelName }) => this.currentSelectedCausalModelName = causalModelName);
    }

    getContextMenuItems(node) {
        const items = {};
        this.#setCausalModelMenuItems(node.data, items);
        this.#setBlockConventionMenuItems(node.data, items);
        this.#setBlockCausesConventionMenuItems(node.data, items);

        return items;
    }

    #setMenuItemsByNodeData({
        nodeData,
        entityNodeType,
        items,
        dialogHelper,
        entityElementNodeCallback
    }) {
        if (nodeData.type !== entityNodeType) {
            return;
        }

        if (nodeData.isRoot) {
            items.add = {
                label: "Add",
                action: () => dialogHelper.add(),
            };
        } else {
            items.rename = {
                label: "Rename",
                action: () => {
                    dialogHelper.rename(nodeData.name);
                },
            };

            items.remove = {
                label: "Remove",
                action: () => {
                    dialogHelper.remove(nodeData.name);
                },
            };
            if (entityElementNodeCallback) {
                entityElementNodeCallback();
            }
        }
        return items;
    }

    //#region Causal Models
    #setCausalModelMenuItems(nodeData, items) {
        this.#setMenuItemsByNodeData({
            nodeData: nodeData,
            entityNodeType: causalModelNodeType,
            items,
            dialogHelper: this.causalModelDialogHelper,
            entityElementNodeCallback: () => {
                if (!this.dataManager.isDefaultMainModel(nodeData.name)) {
                    items.setAsDefaultMainModel = {
                        label: "Set Default",
                        action: () => {
                            this.dataManager.setAsDefaultMainModel(nodeData.name);
                            this.onProjectDataChanged();
                        },
                    };
                }
            }
        });

        return items;
    }

    #handleRenameCausalModel(oldName, newName) {
        if (this.dataManager.isCausalModelNameAlreadyUsed(newName)) {
            alert("Causal model name is already used");
            return;
        }
        this.dataManager.renameCausalModel(oldName, newName);
        this.onProjectDataChanged();
    }

    #handleAddCausalModel(name) {
        if (this.dataManager.isCausalModelNameAlreadyUsed(name)) {
            alert("Causal model name is already used");
            return;
        }
        this.dataManager.addNewCausalModel(name);
        this.onProjectDataChanged();
    }

    #handleRemoveCausalModel(name) {
        if (this.dataManager.isDefaultMainModel(name)) {
            alert(
                "Default main model cannot be removed. Before deleting " +
                "current default main model, set another one as the main one.");
            return;
        }
        this.dataManager.removeCausalModel(name);
        this.#selectDefaultIfCausalModelWasSelected(name);

        this.onProjectDataChanged();
    }

    #selectDefaultIfCausalModelWasSelected(causalModelName) {
        if (this.currentSelectedCausalModelName === causalModelName) {
            eventBus.emit("causalModelSelected", null, {
                causalModelName: this.dataManager.projectData.defaultMainModel,
            });
        }
    }
    //#endregion

    //#region BLock Conventions
    #setBlockConventionMenuItems(nodeData, items) {
        this.#setMenuItemsByNodeData({
            nodeData,
            entityNodeType: blockConventionNodeType,
            items,
            dialogHelper: this.blockConventionDialogHelper
        });
    }

    #handleRenameBlockConvention(oldName, newName) {
        if (this.dataManager.isBlockConventionNameAlreadyUsed(newName)) {
            alert("Block convention name is already used");
            return;
        }
        this.dataManager.renameBlockConvention(oldName, newName);
        this.onProjectDataChanged();
    }

    #handleAddBlockConvention(name) {
        if (this.dataManager.isBlockConventionNameAlreadyUsed(name)) {
            alert("Block convention name is already used");
            return;
        }
        this.dataManager.addNewBlockConvention(name);
        this.onProjectDataChanged();
    }

    #handleRemoveBlockConvention(name) {
        this.dataManager.removeBlockConvention(name);
        this.onProjectDataChanged();
    }
    //#endregion

    //#region Block Cause Conventions
    #setBlockCausesConventionMenuItems(nodeData, items) {
        this.#setMenuItemsByNodeData({
            nodeData,
            entityNodeType: blockCausesConventionNodeType,
            items,
            dialogHelper: this.blockCausesConventionDialogHelper
        });
    }

    #handleRenameBlockCausesConvention(oldName, newName) {
        if (this.dataManager.isBlockCausesConventionNameAlreadyUsed(newName)) {
            alert("Block cause convention name is already used");
            return;
        }
        this.dataManager.renameBlockCausesConvention(oldName, newName);
        this.onProjectDataChanged();
    }

    #handleAddBlockCausesConvention(name) {
        if (this.dataManager.isBlockCausesConventionNameAlreadyUsed(name)) {
            alert("Block cause convention name is already used");
            return;
        }
        this.dataManager.addNewBlockCausesConvention(name);
        this.onProjectDataChanged();
    }

    #handleRemoveBlockCausesConvention(name) {
        this.dataManager.removeBlockCausesConvention(name);
        this.onProjectDataChanged();
    }
    //#endregion
}
