import { CausalRunHelper } from "../causal-cli-integration/causal-run-helper";

const { nativeTheme, shell } = require("electron");

export default class MenuActionHelper {
  constructor(window, projectManager, activeComponentTypes) {
    this.window = window;
    this.projectManager = projectManager;
    this.causalRunHelper = new CausalRunHelper(window, activeComponentTypes);
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
    this.projectManager.createNewProject();
  }

  openProject() {
    this.projectManager.openProject();
  }

  saveProject() {
    this.projectManager.saveProject();
  }

  saveProjectAs() {
    this.projectManager.saveProjectAs();
  }

  importCausalModelFacts() {
    this.projectManager.importCausalModelFacts();
  }

  exportCausalModelFacts() {
    this.projectManager.exportCausalModelFacts();
  }

  runCausalBundle() {

  }

  runCausalBundleWithSpecifiedModel() {

  }

  runProbabilityEstimation() {

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
