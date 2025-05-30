import { PullCausalBundleHelper } from "./pull-causal-bundle-helper.js";

const { FileUtils } = require("./file-utils.js");

/**
 * Responsible for saving and opening files
 */
export class CurrentFileManager {
  appTitleManager;
  #currentFilePath;

  // Previous saved path
  get currentFilePath() {
    return this.#currentFilePath;
  }
  set currentFilePath(val) {
    this.#currentFilePath = val;
    this.appTitleManager.fullPath = val;
    this.appTitleManager.isUnsavedChanges = false;
  }

  constructor(appTitleManager, processDataBeforeSaveCallback, window) {
    this.appTitleManager = appTitleManager;
    this.processDataBeforeSaveCallback = processDataBeforeSaveCallback;
    this.window = window;

    this.pullCausalBundleHelper = new PullCausalBundleHelper(window);
  }

  async handleDataToSave({ saveType, dataToSave, isPrevPathSave, title, fileFilters, mapDataBeforeSaveCallback }) {
    const processedDataToSave =
      this.processDataBeforeSaveCallback?.(dataToSave);

    const mappedDataToSave =
      mapDataBeforeSaveCallback?.(processedDataToSave ?? dataToSave) ??
      processedDataToSave ??
      dataToSave;

    if (
      (isPrevPathSave && saveType == "save" && !this.currentFilePath) ||
      !isPrevPathSave
    ) {
      saveType = "save-as"; // The first save is similar to save-as
    }

    let isCancelled = false;

    switch (saveType) {
      case "save-as":
        const saveRes = await FileUtils.saveByPathFromDialog(
          mappedDataToSave,
          fileFilters ?? null,
          title
        );
        isCancelled = saveRes.canceled;
        if (!isCancelled && isPrevPathSave) {
          this.currentFilePath = saveRes.filePath;
        }
        break;
      case "save":
        await FileUtils.save(this.currentFilePath, mappedDataToSave);
        break;
    }

    if (isPrevPathSave && !isCancelled) {
      this.window.webContents.send("on-saved-to-current-file");
    }
  }

  async openFileData(fileFilters, isPrevPathSave, title) {
    const { openDialogRes, data } = await FileUtils.openByDialog(
      fileFilters,
      title
    );
    if (!openDialogRes.canceled) {
      this.currentFilePath = isPrevPathSave ? openDialogRes.filePaths[0] : null;
      return data;
    }
    return null;
  }

  /**
   * Initiates saving the project to a file.
   * @param {*} saveType 
   * @param {*} fileFilters 
   * @param {*} title 
   * @param {*} isPrevPathSave if true, data will be saved by the previous saved path
   * @param {*} mapDataBeforeSaveCallback 
   */
  async saveData(
    saveType,
    fileFilters,
    title,
    isPrevPathSave,
    mapDataBeforeSaveCallback
  ) {

    const { dataToSave } = await this.pullCausalBundleHelper.pullCausalBundle();
    await this.handleDataToSave({ saveType, dataToSave, isPrevPathSave, title, fileFilters, mapDataBeforeSaveCallback });
  }
}
