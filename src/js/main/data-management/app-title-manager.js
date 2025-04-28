const path = require("path");
const appDefaultTitle = "Causal Studio";

// Responsible for app title changing
export class AppTitleManager {
  #fullPath;
  #isUnsavedChanges;
  constructor(window) {
    this.window = window;
  }

  get fullPath() {
    return this.#fullPath;
  }

  set fullPath(newVal) {
    this.#fullPath = newVal;
    this.#render();
  }

  get isUnsavedChanges() {
    return this.#isUnsavedChanges;
  }

  set isUnsavedChanges(newVal) {
    this.#isUnsavedChanges = newVal;
    this.#render();
  }

  // reset() {
  //   this.#fullPath = null;
  //   this.#isUnsavedChanges = false;
  //   this.#render();
  // }

  #render() {
    let titleToSet = `${this.#isUnsavedChanges ? "*" : ""}`;
    if (this.fullPath) {
      const pathBase = path.parse(this.fullPath).base;
      titleToSet += `${pathBase} - `;
    }

    titleToSet += appDefaultTitle;

    // BrowserWindow.getFocusedWindow()
    this.window.setTitle(titleToSet);
  }
}
