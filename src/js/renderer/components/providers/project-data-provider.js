import { DataProvider } from "./data-provider";
import { Command } from "../../undo-redo/commands/command";

export class ProjectDataProvider extends DataProvider {
    constructor(undoRedoManager) {
        super(undoRedoManager);
    }

    get projectData() {
        return this._data;
    }

    addNewCausalModel(name) {
        const cmd = new Command(
            () => {
                this.projectData.addCausalModel(name);
                this._dispatchMutated();
            },
            () => {
                this.projectData.removeCausalModel(name);
                this._dispatchMutated();
            }
        );
        this.undoRedoManager.execute(cmd);
    }

    setAsDefaultMainModel(name) {
        const oldDefaultModel = this.projectData.defaultMainModel;
        const cmd = new Command(
            () => {
                this.projectData.setDefaultMainModel(name);
                this._dispatchMutated();
            },
            () => {
                this.projectData.setDefaultMainModel(oldDefaultModel);
                this._dispatchMutated();
            }
        );
        this.undoRedoManager.execute(cmd);
    }

    renameCausalModel(oldName, newName) {
        const wasDefault = this.projectData.isDefaultMainModel(oldName);
        const cmd = new Command(
            () => {
                this.projectData.renameCausalModel(oldName, newName);
                if (wasDefault) {
                    this.projectData.setDefaultMainModel(newName);
                }
                this._dispatchMutated();
            },
            () => {
                this.projectData.renameCausalModel(newName, oldName);
                if (wasDefault) {
                    this.projectData.setDefaultMainModel(oldName);
                }
                this._dispatchMutated();
            }
        );
        this.undoRedoManager.execute(cmd);
    }

    removeCausalModel(name) {
        const wasDefault = this.projectData.isDefaultMainModel(name);
        const model = this.projectData.getCausalModel(name);
        const cmd = new Command(
            () => {
                this.projectData.removeCausalModel(name);
                if (wasDefault) {
                    this.projectData.defaultMainModel = null;
                }
                this._dispatchMutated();
            },
            () => {
                this.projectData.causalModels.push(model);
                if (wasDefault) {
                    this.projectData.setDefaultMainModel(name);
                }
                this._dispatchMutated();
            }
        );
        this.undoRedoManager.execute(cmd);
    }
}