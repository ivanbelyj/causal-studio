import { CausalRunHelper } from "../causal-cli-integration/causal-run-helper";
import { DataManager } from "../data-management/data-manager";
import { DataStore } from "../data-management/data-store";

const { nativeTheme, shell } = require("electron");

export default class MenuActionHelper {
  /**
   * 
   * @param {*} window 
   * @param {DataManager} dataManager 
   * @param {*} activeComponentTypes 
   */
  constructor(window, dataManager, activeComponentTypes) {
    this.window = window;
    this.dataManager = dataManager;
    this.activeComponentTypes = activeComponentTypes;
    this.causalRunHelper = new CausalRunHelper(window, activeComponentTypes);
  }

  openModelTransformTool() {
    this.ensureComponentActive("Transform Tools");
  }

  ensureComponentActive(componentType) {
    if (!this.activeComponentTypes.has(componentType)) {
      this.window.webContents.send("set-component-active", {
        componentType: componentType,
        isActive: true,
      });
    }
  }

  sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  selectAllHandler() {
    this.window.webContents.send("select-all");
  }

  undoHandler(menuItem, focusedWin) {
    this.window.webContents.send("undo");
  }

  redoHandler(menuItem, focusedWin) {
    this.window.webContents.send("redo");
  }

  switchTheme(theme) {
    nativeTheme.themeSource = theme;
  }

  createNewProject() {
    this.dataManager.createNewProject();
  }

  openProject() {
    this.dataManager.openProject();
  }

  saveProject() {
    this.dataManager.saveProject();
  }

  saveProjectAs() {
    this.dataManager.saveProjectAs();
  }

  importCausalModelFacts() {
    this.dataManager.importCausalModelFacts();
  }

  exportCausalModelFacts() {
    this.dataManager.exportCausalModelFacts();
  }

  async runCausalBundle() {
    await this.causalRunHelper.runCurrentCausalBundle();
  }

  async runCausalBundleWithSpecifiedModel() {

  }

  async runProbabilityEstimation() {
    await this.causalRunHelper.runCurrentCausalBundleProbabilityEstimation();
  }

  async runCausalBundleWithFilePicker() {
    await this.causalRunHelper.runWithFilePicker("fixate");
  }

  async runProbabilityEstimationWithFilePicker() {
    await this.causalRunHelper.runWithFilePicker("montecarlo");
  }

  async openGitHub() {
    await shell.openExternal("https://github.com/ivanbelyj/causal-studio");
  }

  async learnMore() {
    await shell.openExternal("https://github.com/ivanbelyj/CausalModel");
  }
}
