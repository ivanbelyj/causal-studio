import { ProjectData } from "../../main/data/project-data";
import { CausalViewDataUtils } from "./causal-view-data-utils";

/**
 * Responsible for providing data to the causal view and for background manipulations
 * (such as saving and opening data)
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

  getModelNodesData() {
    return CausalViewDataUtils.causalViewDataToModelNodesData(
      this.causalViewManager.structure.getNodesData()
    );
  }

  getCausalViewData() {
    return this.causalViewManager.structure.getNodesData();
  }


}
