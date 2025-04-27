import { ProjectData } from "../../main/data/project-data";
import { CausalViewDataUtils } from "./causal-view-data-utils";

/**
 * Responsible for providing data to the causal view 
 * and for background manipulations (such as saving and opening data)
 */
export class CausalViewDataManager {
  #causalModelName;
  init({ api, causalViewManager }) {
    this.causalViewManager = causalViewManager;
  }

  set causalModelName(value) {
    this.#causalModelName = value;
  }

  get causalModelName() {
    return this.#causalModelName;
  }

  renameCausalModel(newName) {
    this.causalModelName = newName;
  }

  get isEmpty() {
    // True if the current causal model has not yet been set
    return !this.causalModelName;
  }

  /**
   * Should be called when previous causal bundle is not actual anymore
   * and we'll use another (specific model name will be set later)
   */
  reset() {
    this.causalModelName = null;
  }

  getModelNodesData() {
    return CausalViewDataUtils.causalViewDataToModelNodesData(
      this.causalViewManager.structure.getNodesData()
    );
  }

  getCausalViewData() {
    return this.causalViewManager.structure.getNodesData();
  }
}
