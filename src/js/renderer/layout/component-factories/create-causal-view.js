import * as d3 from "d3";

import { UndoRedoManager } from "../../undo-redo/undo-redo-manager.js";
import { CausalViewManager } from "../../causal-view/causal-view-manager.js";

// Todo:
class CausalViewFactory { }

export function createCausalView(container) {
  const unsubscribeFromEvents = () => {
    container.layoutManager.off("beforeItemDestroyed", beforeItemDestroyed);
    container.layoutManager.off("itemCreated", onItemCreated);
  };

  const beforeItemDestroyed = (event) => {
    if (event.target.componentType === container.componentType) {
      this.savedCausalViewData =
        this.causalView.causalViewDataManager.getCausalViewData();
      unsubscribeFromEvents();
    }
  };

  const onItemCreated = (event) => {
    if (event.target.componentType === container.componentType) {
      if (this.savedCausalViewData) {
        console.log(
          "restoring causal view data",
          this.savedCausalViewData,
          "prev causalViewData: ",
          this.causalView.structure.getNodesData()
        );

        // Don't know, it's just working
        // Todo: normal solution of the errors on reset
        setTimeout(() => {
          this.causalView.reset(this.savedCausalViewData);
        }, 0);
      }
    }
  };

  container.layoutManager.on("beforeItemDestroyed", beforeItemDestroyed);
  container.layoutManager.on("itemCreated", onItemCreated);

  this.causalView = new CausalViewManager(
    container.element,
    this.api,
    this.undoRedoManager,
    this.dataManager
  );

  this.causesChangeManager = this.causalView.causesChangeManager;

  d3.select(container.element).classed("causal-view", true);
  this.causalView.init([]);
}
