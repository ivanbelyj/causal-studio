import { dialog } from "electron";
import { FormatUtils } from "../data/format-utils";
import { ProjectData } from "../data/project-data";
import { UpgradePipeline } from "../data/upgrade/upgrade-pipeline";
import { DataValidator } from "../data/validation/data-validator";

/**
 * High level project data processing component
 */
export class DataProcessingHelper {
  constructor(unsavedChangesHelper) {
    this.upgradePipeline = new UpgradePipeline();
    this.unsavedChangesHelper = unsavedChangesHelper;
  }

  createEmptyProjectData() {
    return ProjectData.createProjectData();
  }

  mutateProjectDataBeforeSave(projectData) {
    FormatUtils.formatProjectData(projectData);
  }

  async processOpenedProjectData(projectData) {
    projectData = await this.#upgradeProjectData(projectData);
    console.log("upgraded project data:", projectData);
    this.#validate(projectData);

    return projectData;
  }

  async #upgradeProjectData(projectData) {
    if (this.upgradePipeline.shouldUpgrade(projectData)) {
      await this.#showDataUpgradeDialog();
      projectData = this.upgradePipeline.upgradeProjectData(projectData);
      this.unsavedChangesHelper.setIsUnsavedChanges(true);
    } else {
      console.log("Project version is up to date");
    }
    return projectData;
  }

  #validate(projectData) {
    const res = DataValidator.validateProjectData(projectData);
    if (res === null) {
      DataProcessingHelper.#showUnknownVersionWarning();
    } else if (res?.length) {
      DataProcessingHelper.#showValidationWarning(res);
    }
  }

  //#region Dialog messages

  async #showDataUpgradeDialog() {
    await dialog.showMessageBox({
      type: "question",
      title: "Data upgrade",
      message:
        "Opened data will be upgraded to the latest version. " +
        "The upgraded data won't be saved to the file immediately after upgrade. " +
        "It's advised to save the updated data to a new file or back up " +
        "the old version, rather than overwriting the current file.",
      buttons: ["Ok"],
      defaultId: 0,
    });
  }

  static #showUnknownVersionWarning() {
    dialog.showMessageBox({
      type: "warning",
      title: "Unknown version",
      message:
        "The data version is either unknown or incorrect, preventing validation. " +
        "Please be aware that the data might not be valid, potentially " +
        "leading to unpredictable behavior within the editor.",
      buttons: ["Ok"],
      defaultId: 0,
    });
  }

  static #showValidationWarning(errors) {
    const errorsString = errors.map((error) => `${error.message}`).join("\n");

    dialog.showMessageBox({
      type: "warning",
      title: "Data validation errors",
      message: "Opened data can be incorrect",
      detail:
        "Some data format requirements are not being met. " +
        "This could stem from external interference with the model, " +
        "such as manual file editing, or an error within the editor. Such issues " +
        "may lead to unstable behavior when working with the causal model. Errors:\n" +
        errorsString,
      buttons: ["Ok"],
    });
  }

  //#endregion
}
