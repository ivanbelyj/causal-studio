import { app } from "electron";
import { CurrentFileManager } from "../data/current-file-manager";
import { UnsavedChangesHelper } from "./unsaved-changes-helper";
import { AppTitleManager } from "./app-title-manager";
import { DataProcessingHelper } from "./data-processing-helper";
import { ProjectData } from "../data/project-data";
import { DataStore } from "./data-store";

const projectFileFilters = [
  {
    name: "Causal Bundle",
    extensions: ["json"],
  }
];

export class DataManager {
  /**
   * 
   * @param {*} window 
   * @param {DataStore} dataStore 
   */
  constructor(window, dataStore) {
    this.window = window;
    this.dataStore = dataStore;

    const appTitleManager = new AppTitleManager(window);

    this.unsavedChangesHelper = new UnsavedChangesHelper({
      window,
      getCurrentFilePathCallback: () => this.filesManager.currentFilePath,
      saveProjectCallback: this.saveProject.bind(this),
      appTitleManager,
    });

    this.projectDataHelper = new DataProcessingHelper(
      this.unsavedChangesHelper
    );

    this.filesManager = new CurrentFileManager(
      appTitleManager,
      this.projectDataHelper.mutateProjectDataBeforeSave,
      window
    );

    window.on("close", this.onClose.bind(this));
  }

  async onClose(event) {
    event.preventDefault();
    await this.confirmUnsavedChanges(() => {
      app.exit();
    });
  }

  async confirmUnsavedChanges(onConfirmed, onCancelled) {
    await this.unsavedChangesHelper.confirmUnsavedChanges(
      onConfirmed,
      onCancelled
    );
  }

  async createNewProject() {
    await this.confirmUnsavedChanges(async () => {
      this.filesManager.currentFilePath = null;
      this.#handleOpenData(this.projectDataHelper.createEmptyProjectData());
    });
  }

  async saveProject() {
    await this.filesManager.saveData(
      "save",
      projectFileFilters,
      "Save",
      true
    );
  }

  async saveProjectAs() {
    await this.filesManager.saveData(
      "save-as",
      projectFileFilters,
      "Save As",
      true
    );
  }

  async openProject() {
    await this.confirmUnsavedChanges(async () => {
      const projectData = await this.filesManager.openFileData(
        projectFileFilters,
        true,
        "Open project"
      );
      if (projectData) {
        this.#handleOpenData(
          await this.projectDataHelper.processOpenedProjectData(projectData)
        );
      }
    });
  }

  #sendMessage(messageName, data) {
    this.window.webContents.send(messageName, data);
  }

  #handleOpenData(projectData) {
    this.#sendMessage("open-data", projectData);
    this.#sendMessage("reset");
    this.dataStore.causalBundle = projectData;
  }
}
