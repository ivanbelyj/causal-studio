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

    this.#initSaveData(api);
    this.#initOpenData(api);
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

  /**
   * Current CausalViewDataManager is used for getting data
   * of the currently editing causal view
   * @param {CausalViewDataManager} causalViewDataManager
   */
  setCurrentCausalViewDataManager(causalViewDataManager) {
    this.currentCausalViewDataManager = causalViewDataManager;
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

  #initSaveData(api) {
    api.onSaveData((event, { dataToSaveId, title }) => {
      event.sender.send(`data-to-save-${dataToSaveId}`, {
        dataToSave: this.#getProjectData(),
        title,
      });
    });
  }

  #getProjectData() {
    return ProjectData.createProjectData({
      ...(this.projectData ?? {}),
      causalModels: this.#getCausalModels(),
    });
  }

  #getCausalModels() {
    const { facts, blocks, nodesData } =
      this.currentCausalViewDataManager.getModelNodesData();

    const currentCausalModel = {
      facts,
      declaredBlocks: blocks,
      nodesData,
      name: this.currentCausalViewDataManager.causalModelName
    };

    return [
      ...this.projectData.causalModels.filter(
        (x) => x.name != currentCausalModel.name
      ),
      currentCausalModel,
    ];
  }

  #initOpenData(api) {
    api.onOpenData((event, projectData) => {
      console.log("opened project data: ", projectData);

      this.projectData = new ProjectData(projectData);

      eventBus.emit("dataOpened", null, { projectData: this.projectData });
    });
  }
}
