import {
  causalModelNodeType,
  blockCausesConventionNodeType,
  blockConventionNodeType,
  blockResolvingMapNodeType
} from "./js-tree-data-utils";

const eventBus = require("js-event-bus")();

/**
 * Causal model node in the Project view.
 * Project view contains nodes. Each one can react differently to user's interactions
 */
export class EventSendingProjectViewNodeHandler {
  handleSelected(instance, node) {
    this.#handleCausalModelSelected(instance, node);
    this.#handleProjectViewNodeSelected(instance, node);
  }

  #handleCausalModelSelected(instance, node) {
    if (node.data.type === causalModelNodeType && !node.data.isRoot) {
      eventBus.emit("causalModelSelected", null, { causalModelName: node.data.name });
    }
  }

  #handleProjectViewNodeSelected(instance, node) {
    if ([
      blockCausesConventionNodeType,
      blockConventionNodeType,
      blockResolvingMapNodeType,
      causalModelNodeType].includes(node.data.type)
      && !node.data.isRoot) {
      eventBus.emit("projectViewNodeSelected", null, { node });
    }
  }
}
