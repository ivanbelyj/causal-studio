import * as d3 from "d3";

import { CausalViewManager } from "../../causal-view/causal-view-manager.js";

export function createCausalView(
  {
    componentsContext,
    api,
    undoRedoManager,
    dataManager
  }, container) {
  const causalView = new CausalViewManager(
    container.element,
    api,
    undoRedoManager,
    dataManager
  );
  // Allow other components to access Causal View and Causes Change Manager
  componentsContext.causalView = causalView;
  componentsContext.causesChangeManager = causalView.causesChangeManager;

  d3.select(container.element).classed("causal-view", true);
  causalView.init([]);

  const unsubscribeFromEvents = () => {
    container.layoutManager.off("beforeItemDestroyed", beforeItemDestroyed);
  };

  const beforeItemDestroyed = (event) => {
    if (event.target.componentType === container.componentType) {
      dataManager.applyUnsavedChanges();
      causalView.destroy();
      unsubscribeFromEvents();
    }
  };

  container.layoutManager.on("beforeItemDestroyed", beforeItemDestroyed);
}
