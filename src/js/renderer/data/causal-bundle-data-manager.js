import { ProjectData } from "../../main/data/project-data";
import { CausalViewDataManager } from "../causal-view/causal-view-data-manager";

const eventBus = require("js-event-bus")();

/** Manages project data, that will be passed to the main process */
export class CausalBundleDataManager extends EventTarget {
  api;
  currentCausalViewDataManager;
  projectData;

  constructor({ api }) {
    super();

    this.api = api;

    this.#initSaveDataListener(api);
    this.#initOpenDataListener(api);
  }

  get causalModels() {
    return this.projectData.causalModels ?? [];
  }

  get defaultMainModel() {
    return this.projectData.defaultMainModel;
  }

  get blockConventions() {
    return this.projectData.blockConventions ?? [];
  }

  get blockCausesConventions() {
    return this.projectData.blockCausesConventions ?? [];
  }

  get blockCausesConventions() {
    return this.projectData.blockCausesConventions ?? [];
  }

  //#region Current causal model

  /**
   * Current CausalViewDataManager is used for getting data
   * of the currently editing causal view
   * @param {CausalViewDataManager} causalViewDataManager
   */
  setCurrentCausalViewDataManager(causalViewDataManager) {
    this.currentCausalViewDataManager = causalViewDataManager;
  }

  applyUnsavedChanges() {
    this.#applyCurrentChangesToCausalModel();
  }

  getCurrentCausalModelFactValueTemplate() {
    return this.#getCurrentCausalModel().factValueTemplate;
  }

  isNodeIdUsedInCurrentCausalModel(nodeId) {
    const currentCausalModel = this.#getCurrentCausalModel();
    return currentCausalModel.facts.some(x => x.id === nodeId)
      || currentCausalModel.declaredBlocks.some(x => x.id === nodeId);
  }
  //#endregion

  #getCurrentCausalModel() {
    return this.#getCausalModelByName(this.currentCausalViewDataManager.causalModelName);
  }

  #getCausalModelByName(causalModelName) {
    return this.projectData.causalModels.find(x => x.name === causalModelName);
  }

  //#region Causal Models
  addNewCausalModel(name) {
    this.projectData.addNewCausalModel(name);
  }

  isDefaultMainModel(name) {
    return this.projectData.isDefaultMainModel(name);
  }

  setAsDefaultMainModel(name) {
    this.projectData.setAsDefaultMainModel(name);
  }

  renameCausalModel(oldName, newName) {
    if (this.currentCausalViewDataManager.causalModelName == oldName) {
      this.currentCausalViewDataManager.renameCausalModel(newName);
    }
    this.projectData.renameCausalModel(oldName, newName);
  }

  isCausalModelNameAlreadyUsed(name) {
    return this.projectData.isCausalModelNameAlreadyUsed(name);
  }

  removeCausalModel(name) {
    this.projectData.removeCausalModel(name);
  }
  //#endregion

  //#region Block Conventions
  addNewBlockConvention(name) {
    this.projectData.addNewBlockConvention(name);
  }

  renameBlockConvention(oldName, newName) {
    this.projectData.renameBlockConvention(oldName, newName);
  }

  isBlockConventionNameAlreadyUsed(name) {
    return this.projectData.isBlockConventionNameAlreadyUsed(name);
  }

  removeBlockConvention(name) {
    this.projectData.removeBlockConvention(name);
  }
  //#endregion

  //#region Block Cause Conventions
  addNewBlockCausesConvention(name) {
    this.projectData.addNewBlockCausesConvention(name);
  }

  renameBlockCausesConvention(oldName, newName) {
    this.projectData.renameBlockCausesConvention(oldName, newName);
  }

  isBlockCausesConventionNameAlreadyUsed(name) {
    return this.projectData.isBlockCausesConventionNameAlreadyUsed(name);
  }

  removeBlockCausesConvention(name) {
    this.projectData.removeBlockCausesConvention(name);
  }
  //#endregion

  #applyCurrentChangesToCausalModel() {
    if (this.currentCausalViewDataManager.isEmpty) {
      // Nothing to apply
      return;
    }

    const currentCausalModelName = this.currentCausalViewDataManager.causalModelName;

    const currentCausalModel = this.projectData.causalModels.find(
      x => x.name === currentCausalModelName);
    if (!currentCausalModel) {
      // Maybe the method was called before select another model
      // and the current causal model was deleted
      return;
    }

    const { facts, blocks, nodesData } =
      this.currentCausalViewDataManager.getModelNodesData();

    Object.assign(
      currentCausalModel,
      {
        facts,
        declaredBlocks: blocks,
        nodesData,
        name: currentCausalModelName
      });
  }

  #initSaveDataListener(api) {
    api.onPullCausalBundle((event, { dataToSaveId }) => {
      this.applyUnsavedChanges();
      event.sender.send(`pull-causal-bundle-result-${dataToSaveId}`, {
        // Transform the data to the final form
        // in order to meet the requirements of the format
        dataToSave: ProjectData.createProjectData({
          ...(this.projectData ?? {}),
        })
      });
    });
  }

  #initOpenDataListener(api) {
    api.onOpenData((event, projectData) => {

      this.projectData = ProjectData.createProjectData(projectData);
      console.log("opened project data: ", this.projectData);

      this.currentCausalViewDataManager.reset();

      eventBus.emit("dataOpened", null, { projectData: this.projectData });
    });
  }
}
